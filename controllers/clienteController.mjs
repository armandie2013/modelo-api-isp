import Cliente from "../models/Cliente.mjs";
import { obtenerHistorialFinanciero } from "../services/historialClienteService.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

export async function mostrarPanelCliente(req, res) {
  try {
    // console.log("Usuario logueado:", req.session.usuario);
    const cliente = await Cliente.findOne({ dni: req.session.usuario.dni })
      .populate("plan")
      .lean();

    if (!cliente) {
      return res.status(404).render("errorGenerico", {
        titulo: "Error",
        mensaje: "Cliente no encontrado.",
      });
    }

    // Formateo del precio del plan
    if (cliente.plan?.precio) {
      cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
    }

    const historial = await obtenerHistorialFinanciero(cliente._id);

    res.render("clienteViews/panelCliente", { cliente, historial });
  } catch (error) {
    console.error("Error al cargar el panel del cliente:", error);
    res.status(500).send("Error al cargar los datos del cliente");
  }
}
