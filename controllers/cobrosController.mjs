import Cliente from "../models/Cliente.mjs";
import Cobro from "../models/Cobro.mjs";
import {
  registrarCobro,
  obtenerCobroPorId,
} from "../services/cobrosService.mjs";
import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";

export const mostrarFormularioBusqueda = (req, res) => {
  res.render("cobradorViews/buscarCliente", {
    titulo: "Buscar Cliente",
    cliente: null,
    mensaje: null,
  });
};

export const procesarBusquedaCliente = async (req, res) => {
  const { dni } = req.query;

  try {
    const cliente = await Cliente.findOne({ dni }).populate("plan");
    if (!cliente) {
      return res.render("cobradorViews/buscarCliente", {
        titulo: "Buscar Cliente",
        cliente: null,
        mensaje: "No se encontró el cliente.",
      });
    }

    res.render("cobradorViews/buscarCliente", {
      titulo: "Buscar Cliente",
      cliente,
      mensaje: null,
    });
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Error al buscar cliente.",
    });
  }
};

export const procesarCobro = async (req, res) => {
  try {
    const { clienteId, facturasSeleccionadas } = req.body;
    const cobradorId = req.session.usuario._id;

    const cobro = await registrarCobro({
      clienteId,
      cobradorId,
      facturasSeleccionadas: Array.isArray(facturasSeleccionadas)
        ? facturasSeleccionadas
        : [facturasSeleccionadas],
    });

    res.redirect(`/cobros/${cobro._id}/recibo`);
  } catch (error) {
    console.error("Error al registrar cobro:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error al registrar cobro",
      mensaje: error.message,
    });
  }
};

export const mostrarRecibo = async (req, res) => {
  try {
    const cobro = await obtenerCobroPorId(req.params.id);
    res.render("cobradorViews/reciboCobro", {
      titulo: "Recibo de Cobro",
      cobro,
    });
  } catch (error) {
    console.error("Error al mostrar recibo:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "No se pudo cargar el recibo.",
    });
  }
};

export const mostrarPanelCobrador = async (req, res) => {
  try {
    const cobradorId = req.session.usuario._id;

    const resumen = await obtenerResumenCajaCobrador(cobradorId);

    res.render("cobradorViews/panelCobrador", {
      titulo: "Panel del Cobrador",
      cobros: resumen.cobros,
      montoTotal: resumen.acumuladoActual,
      totalCobrado: resumen.totalCobrado,
      totalRetirado: resumen.totalRetirado,
    });
  } catch (error) {
    console.error("Error al mostrar panel del cobrador:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Error al cargar el panel del cobrador.",
    });
  }
};
