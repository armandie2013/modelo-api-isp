import Usuario from "../models/Usuario.mjs";
import Cobro from "../models/Cobro.mjs";
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