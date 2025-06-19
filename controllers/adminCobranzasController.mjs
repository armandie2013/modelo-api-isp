import mongoose from "mongoose";
import Usuario from "../models/Usuario.mjs";
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";
import Factura from "../models/Factura.mjs";
import Retiro from "../models/RetiroCobrador.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";
import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";

export const mostrarPanelAdminCobranzas = async (req, res) => {
  try {
    const cobradores = await Usuario.find({ rol: "cobrador" });

    const cobradoresConDatos = await Promise.all(
      cobradores.map(async (cobrador) => {
        const cobros = await Cobro.find({ cobrador: cobrador._id });
        const retiros = await RetiroCobrador.find({
          cobrador: cobrador._id,
        }).sort({ fecha: -1 });

        const montoRecaudado = cobros.reduce(
          (acc, c) => acc + c.totalCobrado,
          0
        );
        const ultimaFechaRetiro =
          retiros.length > 0
            ? new Date(retiros[0].fecha).toLocaleDateString("es-AR")
            : null;

        return {
          _id: cobrador._id,
          nombre: cobrador.nombre,
          apellido: cobrador.apellido,
          email: cobrador.email,
          montoRecaudadoFormateado: formatearMonedaARS(montoRecaudado),
          ultimaFechaRetiro,
        };
      })
    );

    // Agrupar facturas por mes
    const facturas = await Factura.find().lean();
    const recaudacionesPorMes = {};

    facturas.forEach(factura => {
      const fecha = new Date(factura.fecha);
      const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

      if (!recaudacionesPorMes[key]) {
        recaudacionesPorMes[key] = {
          total: 0,
          mes: fecha.toLocaleString("es-AR", { month: "long" }),
          anio: fecha.getFullYear(),
        };
      }

      recaudacionesPorMes[key].total += factura.importe;
    });

    const tarjetasRecaudacion = Object.entries(recaudacionesPorMes).map(
      ([key, val]) => ({
        key,
        mes: val.mes.charAt(0).toUpperCase() + val.mes.slice(1),
        anio: val.anio,
        total: formatearMonedaARS(val.total),
      })
    ).sort((a, b) => new Date(`${a.anio}-${a.key.split('-')[1]}-01`) - new Date(`${b.anio}-${b.key.split('-')[1]}-01`));

    // Calcular total de retiros
    const retirosTotales = await Retiro.find();
    const totalRetiros = retirosTotales.reduce((acc, r) => acc + (r.monto || 0), 0);
    const totalRetirosFormateado = formatearMonedaARS(totalRetiros);

    res.render("adminViews/panelAdminCobranzas", {
      titulo: "Panel de Cobranzas",
      cobradores: cobradoresConDatos,
      tarjetasRecaudacion,
      totalRetirosFormateado,
    });
  } catch (error) {
    console.error(
      "Error al mostrar el panel del administrador de cobranzas:",
      error
    );
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Hubo un problema al cargar el panel de cobranzas.",
    });
  }
};

export async function mostrarPanelCobradorDesdeAdmin(req, res) {
  try {
    const cobradorId = req.params.id;

    const cobrador = await Usuario.findById(cobradorId);
    if (!cobrador) {
      req.flash("error", "Cobrador no encontrado");
      return res.redirect("/admin/cobranzas");
    }

    const cobros = await Cobro.find({ cobrador: cobradorId })
      .populate("cliente")
      .sort({ fecha: -1 });

    const retiros = await RetiroCobrador.find({ cobrador: cobradorId }).sort({
      fecha: -1,
    });

    const totalCobrado = cobros.reduce((acc, c) => acc + c.totalCobrado, 0);
    const totalCobradoFormateado = formatearMonedaARS(totalCobrado);

    // 🔍 Verificar si el código está activo y si está vencido (más de 24h)
    let codigoExpirado = false;
    let codigoGenerado = null;

    const codigoActivo = await CodigoRetiro.findOne({
      cobrador: new mongoose.Types.ObjectId(cobradorId),
      estado: "activo",
    });

    if (codigoActivo) {
      const ahora = new Date();
      const expirado = (ahora - codigoActivo.fechaGeneracion) > 24 * 60 * 60 * 1000;

      if (expirado) {
        codigoExpirado = true;

        // ✅ Opcional: Marcar como expirado en la BD
        codigoActivo.estado = "expirado";
        await codigoActivo.save();
      } else {
        codigoGenerado = codigoActivo.codigo;
      }
    }

    res.render("adminViews/panelCobradorDesdeAdmin", {
      titulo: `Panel de ${cobrador.nombre} ${cobrador.apellido}`,
      cobrador,
      cobros: cobros.map((c) => ({
        ...c.toObject(),
        importeFormateado: formatearMonedaARS(c.totalCobrado),
        fechaFormateada: new Date(c.fecha).toLocaleDateString("es-AR"),
      })),
      retiros,
      totalCobrado,
      totalCobradoFormateado,
      codigoGenerado,
      codigoExpirado,
    });
  } catch (error) {
    console.error("Error al mostrar panel de cobrador desde admin:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Error al cargar el panel del cobrador.",
    });
  }
}

export const mostrarPanelAdminComoCobrador = async (req, res) => {
  try {
    const adminId = req.session.usuario._id;

    const resumen = await obtenerResumenCajaCobrador(adminId);

    const cobros = await Cobro.find({ cobrador: adminId })
      .populate("cliente")
      .sort({ fecha: -1 });

    const cobrosFormateados = cobros.map((c) => ({
      ...c.toObject(),
      importeFormateado: formatearMonedaARS(c.totalCobrado),
      fechaFormateada: new Date(c.fecha).toLocaleDateString("es-AR"),
    }));

    res.render("adminViews/panelAdminCobrador", {
      titulo: "Mi Panel como Cobrador",
      cobros: cobrosFormateados,
      totalCobrado: formatearMonedaARS(resumen.totalCobrado),
      totalRetirado: formatearMonedaARS(resumen.totalRetirado),
      montoTotal: formatearMonedaARS(resumen.acumuladoActual),
    });
  } catch (error) {
    console.error("Error al cargar panel del admin como cobrador:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "No se pudo cargar el panel.",
    });
  }
};
