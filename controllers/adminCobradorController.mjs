import { obtenerResumenCajaCobrador } from "../services/resumenCajaService.mjs";
import Usuario from "../models/Usuario.mjs";
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import { formatearMonedaARS } from "../utils/formatoMoneda.mjs";

export const mostrarPanelAdminComoCobrador = async (req, res) => {
  try {
    const adminId = req.session.usuario._id;

    const admin = await Usuario.findById(adminId);
    if (!admin) {
      req.flash("error", "Administrador no encontrado");
      return res.redirect("/admin/cobranzas");
    }

    const resumen = await obtenerResumenCajaCobrador(adminId);

    const cobrosConFormato = await Promise.all(
      resumen.cobros.map(async (cobro) => {
        const cliente = await Usuario.findById(cobro.cliente);
        return {
          ...cobro.toObject(),
          cliente,
          fechaFormateada: new Date(cobro.fecha).toLocaleDateString("es-AR"),
          importeFormateado: formatearMonedaARS(cobro.totalCobrado),
        };
      })
    );

    res.render("adminViews/panelAdminCobrador", {
      titulo: "Panel de Recaudación (Admin)",
      totalCobrado: formatearMonedaARS(resumen.totalCobrado),
      totalRetirado: formatearMonedaARS(resumen.totalRetirado),
      montoDisponible: formatearMonedaARS(resumen.acumuladoActual),
      cobros: cobrosConFormato,
      retiros: resumen.retiros,
      admin,
    });
  } catch (error) {
    console.error("Error en panel de admin como cobrador:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Error al cargar el panel del administrador como cobrador.",
    });
  }
};
