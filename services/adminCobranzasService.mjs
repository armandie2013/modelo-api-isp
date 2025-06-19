import Usuario from "../models/Usuario.mjs";
import Cobro from "../models/Cobro.mjs";
import Factura from "../models/Factura.mjs";
import Retiro from "../models/Retiro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";

export async function obtenerResumenesDeCobradores() {
  // Traemos todos los usuarios con rol 'cobrador'
  const cobradores = await Usuario.find({ rol: "cobrador" });

  // Creamos un array con los resúmenes
  const resumenes = await Promise.all(
    cobradores.map(async (cobrador) => {
      const cobros = await Cobro.find({ cobrador: cobrador._id });
      const retiros = await RetiroCobrador.find({ cobrador: cobrador._id }).sort({ fecha: -1 });

      const totalCobrado = cobros.reduce((acc, c) => acc + c.totalCobrado, 0);
      const totalRetirado = retiros.reduce((acc, r) => acc + r.importe, 0);
      const totalRecaudado = totalCobrado - totalRetirado;

      return {
        _id: cobrador._id,
        nombre: cobrador.nombre,
        apellido: cobrador.apellido,
        totalRecaudado,
        totalRecaudadoFormateado: totalRecaudado.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
        }),
        ultimaFechaRetiro: retiros[0]?.fecha || null,
      };
    })
  );

  return resumenes;
}

export async function obtenerRecaudacionesPorMes() {
  const facturas = await Factura.find().lean();

  const recaudacionesPorMes = {};

  facturas.forEach(factura => {
    const fecha = new Date(factura.fecha);
    const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`; // Ej: "2025-7"

    if (!recaudacionesPorMes[key]) {
      recaudacionesPorMes[key] = {
        total: 0,
        mes: fecha.toLocaleString("es-AR", { month: "long" }),
        anio: fecha.getFullYear(),
      };
    }

    recaudacionesPorMes[key].total += factura.importe;
  });

  return Object.entries(recaudacionesPorMes).map(([key, val]) => ({
    key,
    mes: val.mes.charAt(0).toUpperCase() + val.mes.slice(1), // Capitaliza
    anio: val.anio,
    total: val.total,
  })).sort((a, b) => new Date(`${a.anio}-${a.key.split('-')[1]}-01`) - new Date(`${b.anio}-${b.key.split('-')[1]}-01`));
}

export async function obtenerTotalRetiros() {
  const retiros = await Retiro.find().lean();
  return retiros.reduce((total, r) => total + (r.monto || 0), 0);
}