import Usuario from "../models/Usuario.mjs";
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";
import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";
import { obtenerResumenesDeCobradores } from "../services/adminCobranzasService.mjs";

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

    res.render("adminViews/panelAdminCobranzas", {
      titulo: "Panel de Cobranzas",
      cobradores: cobradoresConDatos,
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

    // ✅ Primero calculás el totalCobrado
    const totalCobrado = cobros.reduce((acc, c) => acc + c.totalCobrado, 0);

    // ✅ Luego lo formateás
    const totalCobradoFormateado = formatearMonedaARS(totalCobrado);

    // ✅ Buscar código activo
    const codigoActivo = await CodigoRetiro.findOne({
      cobradorId,
      estado: "activo",
    });

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
      codigoGenerado: codigoActivo?.codigo || null,
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
