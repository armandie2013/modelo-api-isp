import Plan from "../models/Plan.mjs";
import Cliente from "../models/Cliente.mjs";
import Factura from '../models/Factura.mjs';
import { generarCargosParaTodos } from "../services/cargosService.mjs";
import { obtenerSiguienteNumeroDeComprobante } from "../utils/obtenerSiguienteComprobante.mjs";

// GET /clientes/crear
export const mostrarFormularioCrearCliente = async (req, res) => {
  try {
    const planes = await Plan.find().lean();
    res.render("clientesViews/crearCliente", {
      titulo: "Registrar nuevo cliente",
      planes,
      datos: {},
      errores: [],
    });
  } catch (error) {
    console.error("Error al mostrar formulario de cliente:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// POST /clientes/crear
export const procesarCreacionCliente = async (req, res) => {
  const { nombre, apellido, dni, direccion, telefono, email, plan } = req.body;
  const errores = [];

  if (!nombre || !apellido || !dni || !direccion || !telefono || !email || !plan) {
    errores.push("Todos los campos son obligatorios");
  }

  try {
    if (errores.length > 0) {
      const planes = await Plan.find().lean();
      return res.render("clientesViews/crearCliente", {
        titulo: "Registrar nuevo cliente",
        planes,
        datos: req.body,
        errores,
      });
    }

    const nuevoCliente = new Cliente({
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      email,
      plan,
    });

    await nuevoCliente.save();
    res.redirect("/clientes/dashboard");
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).send("Error al registrar cliente");
  }
};

export const mostrarDashboardClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().populate("plan").lean();

    res.render("clientesViews/dashboardClientes", {
      titulo: "Listado de Clientes",
      clientes,
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).send("Error al obtener los clientes");
  }
};

// GET /clientes/editar/:id
export const mostrarFormularioEditarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) return res.status(404).send("Cliente no encontrado");

    const planes = await Plan.find().lean();

    res.render("clientesViews/editarCliente", {
      titulo: "Editar Cliente",
      cliente,
      planes,
    });
  } catch (error) {
    console.error("Error al mostrar cliente:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// POST /clientes/editar/:id
export const procesarEdicionCliente = async (req, res) => {
  try {
    const { nombre, apellido, dni, direccion, telefono, email, plan } = req.body;

    await Cliente.findByIdAndUpdate(req.params.id, {
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      email,
      plan,
    });

    res.redirect("/clientes/dashboard");
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).send("Error al actualizar cliente");
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.redirect("/clientes/dashboard");
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).send("Error al eliminar cliente");
  }
};

export const mostrarHistorialCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).populate("plan").lean();
    if (!cliente) {
      return res.status(404).send("Cliente no encontrado");
    }

    res.render("clientesViews/historialCliente", {
      titulo: `Historial de ${cliente.nombre} ${cliente.apellido}`,
      cliente,
      historial: cliente.historial,
    });
  } catch (error) {
    console.error("Error al obtener historial del cliente:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// POST /clientes/generar-cargos
export const generarCargosMensuales = async (req, res) => {
  try {
    const clientes = await Cliente.find().populate('plan');

    for (const cliente of clientes) {
      const fechaHoy = new Date();
      const nombreMes = fechaHoy.toLocaleString("default", { month: "long" }).toUpperCase();
      const detalle = `Factura por servicio - ${nombreMes}`;
      const numeroDeComprobante = await obtenerSiguienteNumeroDeComprobante();

      // Verificamos si ya existe una factura igual (por mes)
      const yaExiste = await Factura.findOne({
        cliente: cliente._id,
        detalle,
        fecha: {
          $gte: new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1),
          $lte: new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0)
        }
      });

      if (!yaExiste) {
        const nuevaFactura = new Factura({
          cliente: cliente._id,
          fecha: fechaHoy,
          detalle,
          importe: cliente.plan.precio,
          numeroDeComprobante
        });

        await nuevaFactura.save();
      }
    }

    res.redirect("/clientes/dashboard");
  } catch (error) {
    console.error("Error al generar cargos mensuales:", error);
    res.status(500).send("Error al generar cargos mensuales");
  }
};

export const mostrarPanelCliente = (req, res) => {
  const usuario = req.session.usuario;

  if (!usuario) {
    return res.redirect("/login");
  }

  res.render("clientesViews/panelCliente", {
    usuario
  });
};