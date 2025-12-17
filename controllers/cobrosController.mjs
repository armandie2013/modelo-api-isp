// import Cliente from "../models/Cliente.mjs";
// import Pago from "../models/Pago.mjs";
// import Factura from "../models/Factura.mjs";
// import Cobro from "../models/Cobro.mjs";
// import {
//   registrarCobro,
//   obtenerCobroPorId,
// } from "../services/cobrosService.mjs";
// import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";
// import { obtenerHistorialFinanciero } from "../services/historialClienteService.mjs";
// import { obtenerSiguienteNumeroDeComprobante } from "../utils/obtenerSiguienteComprobante.mjs";
// import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

// export const mostrarFormularioBusqueda = (req, res) => {
//   res.render("cobradorViews/buscarCliente", {
//     titulo: "Buscar Cliente",
//     cliente: null,
//     mensaje: null,
//   });
// };

// export const procesarBusquedaCliente = async (req, res) => {
//   try {
//     const { dni } = req.query;

//     const cliente = await Cliente.findOne({ dni }).populate("plan");
//     if (!cliente) {
//       return res.render("cobradorViews/buscarCliente.ejs", {
//         error: "Cliente no encontrado",
//         cliente: null,
//       });
//     }

//     // ✅ Formatear precio del plan
//     if (cliente.plan?.precio) {
//       cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
//     }

//     // 📊 Historial financiero del cliente
//     const historial = await obtenerHistorialFinanciero(cliente._id);

//     // ✅ Saldo actual del cliente (último registro del historial)
//     const saldoActual =
//       historial.length > 0 ? historial[historial.length - 1].saldo : 0;

//     const saldoFormateado = formatearMonedaARS(saldoActual);

//     // 📄 Facturas impagas
//     const facturasImpagas = await Factura.find({
//       cliente: cliente._id,
//       pagada: false,
//     }).sort({ fecha: 1 });

//     const facturasImpagasFormateadas = facturasImpagas.map((f) => ({
//       ...f.toObject(),
//       importeFormateado: formatearMonedaARS(f.importe),
//     }));

//     res.render("cobradorViews/verClienteCobro.ejs", {
//       cliente,
//       historial,
//       facturasImpagas: facturasImpagasFormateadas,

//       // ✅ estas 2 son las que vas a usar en la vista
//       saldoActual,
//       saldoFormateado,

//       usuario: req.session.usuario,
//     });
//   } catch (error) {
//     console.error("Error al procesar búsqueda de cliente:", error);
//     res.status(500).send("Error al procesar búsqueda");
//   }
// };



// export const procesarCobro = async (req, res) => {
//   try {
//     const { clienteId, facturasSeleccionadas } = req.body;
//     const cobradorId = req.session.usuario._id;

//     if (!facturasSeleccionadas || facturasSeleccionadas.length === 0) {
//       return res.status(400).send("No se seleccionaron facturas para cobrar.");
//     }

//     const facturasIds = Array.isArray(facturasSeleccionadas)
//       ? facturasSeleccionadas
//       : [facturasSeleccionadas];

//     const facturas = await Factura.find({
//       _id: { $in: facturasIds },
//       pagada: false,
//     });

//     if (facturas.length === 0) {
//       return res.status(400).send("No se encontraron facturas válidas.");
//     }

//     const nuevoCobro = await registrarCobro({
//       clienteId,
//       cobradorId,
//       facturas,
//     });

//     res.redirect(`/cobros/${nuevoCobro._id}/recibo`);
//   } catch (error) {
//     console.error("Error al registrar cobro:", error);
//     res.status(500).send("Error al registrar el cobro.");
//   }
// };

// export const mostrarRecibo = async (req, res) => {
//   try {
//     const cobro = await obtenerCobroPorId(req.params.id);
//     if (!cobro) {
//       return res.status(404).render("errorGenerico", {
//         titulo: "Error",
//         mensaje: "Cobro no encontrado.",
//       });
//     }

//     cobro.totalCobradoFormateado = formatearMonedaARS(cobro.totalCobrado);
//     if (Array.isArray(cobro.facturasPagadas)) {
//       cobro.facturasPagadas.forEach((f) => {
//         f.importeFormateado = formatearMonedaARS(f.importe);
//       });
//     }

//     res.render("cobradorViews/reciboCobro", {
//       titulo: "Recibo de Cobro",
//       cobro,
//     });
//   } catch (error) {
//     console.error("Error al mostrar recibo:", error);
//     res.status(500).render("errorGenerico", {
//       titulo: "Error",
//       mensaje: "No se pudo cargar el recibo.",
//     });
//   }
// };

// export async function mostrarPanelCobrador(req, res) {
//   try {
//     const cobradorId = req.session.usuario._id;

//     const { movimientos, acumuladoActual, ultimosCobros } = await obtenerResumenCajaCobrador(cobradorId);

//     const montoFormateado = acumuladoActual.toLocaleString("es-AR", {
//       style: "currency",
//       currency: "ARS"
//     });

//     res.render("cobradorViews/panelCobrador", {
//       titulo:"Panel Cobrador",
//       movimientos,
//       montoFormateado,
//       ultimosCobros // 👈 Agregado acá
//     });

//   } catch (error) {
//     console.error("Error al mostrar el panel del cobrador:", error);
//     res.status(500).send("Error al mostrar el panel del cobrador");
//   }
// }

// export const mostrarHistorialCliente = async (req, res) => {
//   try {
//     const clienteId = req.params.clienteId;

//     const cliente = await Cliente.findById(clienteId).populate("plan").lean();
//     if (!cliente) return res.status(404).send("Cliente no encontrado");

//     if (cliente.plan?.precio) {
//       cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
//     }

//     const historial = await obtenerHistorialFinanciero(clienteId);

//     res.render("clientesViews/historialCliente", {
//       titulo: `Historial de ${cliente.nombre} ${cliente.apellido}`,
//       cliente,
//       historial,
//     });
//   } catch (error) {
//     console.error("Error al mostrar historial del cliente:", error);
//     res.status(500).send("Error al cargar el historial");
//   }
// };

// export const mostrarHistorialPropioCliente = async (req, res) => {
//   try {
//     const clienteId = req.session.usuario._id;

//     const cliente = await Cliente.findById(clienteId).populate("plan").lean();
//     if (!cliente) return res.status(404).send("Cliente no encontrado");

//     if (cliente.plan?.precio) {
//       cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
//     }

//     const historial = await obtenerHistorialFinanciero(cliente._id);

//     res.render("clientesViews/historialCliente", {
//       titulo: `Historial de ${cliente.nombre} ${cliente.apellido}`,
//       cliente,
//       historial,
//     });
//   } catch (error) {
//     console.error("Error al mostrar historial del cliente autenticado:", error);
//     res.status(500).send("Error al mostrar historial");
//   }
// };

// export const mostrarHistorialDelClienteLogueado = async (req, res) => {
//   try {
//     const cliente = await Cliente.findOne({
//       dni: req.session.usuario.dni,
//     }).populate("plan").lean();

//     if (!cliente) {
//       return res.status(404).send("Cliente no encontrado");
//     }

//     if (cliente.plan?.precio) {
//       cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
//     }

//     const historial = await obtenerHistorialFinanciero(cliente._id);

//     res.render("clientesViews/verHistorialCliente", {
//       titulo: `Mi Historial`,
//       cliente,
//       historial,
//       usuario: req.session.usuario,
//     });
//   } catch (error) {
//     console.error("Error al mostrar historial del cliente logueado:", error);
//     res.status(500).send("Error interno del servidor");
//   }
// };


// NO BORRAR LO ANTERIOR HASTA ESTAR SEGURO QUE LO DE ABAJO FUNCIONA BIEN //

import Cliente from "../models/Cliente.mjs";
import Pago from "../models/Pago.mjs";
import Factura from "../models/Factura.mjs";
import Cobro from "../models/Cobro.mjs";
import {
  registrarCobro,
  obtenerCobroPorId,
} from "../services/cobrosService.mjs";
import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";
import { obtenerHistorialFinanciero } from "../services/historialClienteService.mjs";
import { obtenerSiguienteNumeroDeComprobante } from "../utils/obtenerSiguienteComprobante.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

// ✅ NUEVO: volver según rol
import {
  obtenerRutaPanelPorRol,
  obtenerLabelVolverPorRol,
} from "../utils/obtenerRutaPanelPorRol.mjs";

export const mostrarFormularioBusqueda = (req, res) => {
  res.render("cobradorViews/buscarCliente", {
    titulo: "Buscar Cliente",
    cliente: null,
    mensaje: null,
  });
};

export const procesarBusquedaCliente = async (req, res) => {
  try {
    const { dni } = req.query;

    const cliente = await Cliente.findOne({ dni }).populate("plan");
    if (!cliente) {
      return res.render("cobradorViews/buscarCliente.ejs", {
        error: "Cliente no encontrado",
        cliente: null,
      });
    }

    // ✅ Formatear precio del plan
    if (cliente.plan?.precio) {
      cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
    }

    // 📊 Historial financiero del cliente
    const historial = await obtenerHistorialFinanciero(cliente._id);

    // ✅ Saldo actual del cliente (último registro del historial)
    const saldoActual =
      historial.length > 0 ? historial[historial.length - 1].saldo : 0;

    const saldoFormateado = formatearMonedaARS(saldoActual);

    // 📄 Facturas impagas
    const facturasImpagas = await Factura.find({
      cliente: cliente._id,
      pagada: false,
    }).sort({ fecha: 1 });

    const facturasImpagasFormateadas = facturasImpagas.map((f) => ({
      ...f.toObject(),
      importeFormateado: formatearMonedaARS(f.importe),
    }));

    res.render("cobradorViews/verClienteCobro.ejs", {
      cliente,
      historial,
      facturasImpagas: facturasImpagasFormateadas,

      // ✅ estas 2 son las que vas a usar en la vista
      saldoActual,
      saldoFormateado,

      usuario: req.session.usuario,
    });
  } catch (error) {
    console.error("Error al procesar búsqueda de cliente:", error);
    res.status(500).send("Error al procesar búsqueda");
  }
};

export const procesarCobro = async (req, res) => {
  try {
    const { clienteId, facturasSeleccionadas } = req.body;
    const cobradorId = req.session.usuario._id;

    if (!facturasSeleccionadas || facturasSeleccionadas.length === 0) {
      return res.status(400).send("No se seleccionaron facturas para cobrar.");
    }

    const facturasIds = Array.isArray(facturasSeleccionadas)
      ? facturasSeleccionadas
      : [facturasSeleccionadas];

    const facturas = await Factura.find({
      _id: { $in: facturasIds },
      pagada: false,
    });

    if (facturas.length === 0) {
      return res.status(400).send("No se encontraron facturas válidas.");
    }

    const nuevoCobro = await registrarCobro({
      clienteId,
      cobradorId,
      facturas,
    });

    res.redirect(`/cobros/${nuevoCobro._id}/recibo`);
  } catch (error) {
    console.error("Error al registrar cobro:", error);
    res.status(500).send("Error al registrar el cobro.");
  }
};

export const mostrarRecibo = async (req, res) => {
  try {
    const cobro = await obtenerCobroPorId(req.params.id);
    if (!cobro) {
      return res.status(404).render("errorGenerico", {
        titulo: "Error",
        mensaje: "Cobro no encontrado.",
      });
    }

    cobro.totalCobradoFormateado = formatearMonedaARS(cobro.totalCobrado);
    if (Array.isArray(cobro.facturasPagadas)) {
      cobro.facturasPagadas.forEach((f) => {
        f.importeFormateado = formatearMonedaARS(f.importe);
      });
    }

    // ✅ NUEVO: destino de volver según rol
    const usuario = req.session.usuario;

    res.render("cobradorViews/reciboCobro", {
      titulo: "Recibo de Cobro",
      cobro,

      // ✅ agregado
      usuario,
      volverUrl: obtenerRutaPanelPorRol(usuario),
      volverLabel: obtenerLabelVolverPorRol(usuario),
    });
  } catch (error) {
    console.error("Error al mostrar recibo:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "No se pudo cargar el recibo.",
    });
  }
};

export async function mostrarPanelCobrador(req, res) {
  try {
    const cobradorId = req.session.usuario._id;

    const { movimientos, acumuladoActual, ultimosCobros } =
      await obtenerResumenCajaCobrador(cobradorId);

    const montoFormateado = acumuladoActual.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

    res.render("cobradorViews/panelCobrador", {
      titulo: "Panel Cobrador",
      movimientos,
      montoFormateado,
      ultimosCobros, // 👈 Agregado acá
    });
  } catch (error) {
    console.error("Error al mostrar el panel del cobrador:", error);
    res.status(500).send("Error al mostrar el panel del cobrador");
  }
}

export const mostrarHistorialCliente = async (req, res) => {
  try {
    const clienteId = req.params.clienteId;

    const cliente = await Cliente.findById(clienteId).populate("plan").lean();
    if (!cliente) return res.status(404).send("Cliente no encontrado");

    if (cliente.plan?.precio) {
      cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
    }

    const historial = await obtenerHistorialFinanciero(clienteId);

    res.render("clientesViews/historialCliente", {
      titulo: `Historial de ${cliente.nombre} ${cliente.apellido}`,
      cliente,
      historial,
    });
  } catch (error) {
    console.error("Error al mostrar historial del cliente:", error);
    res.status(500).send("Error al cargar el historial");
  }
};

export const mostrarHistorialPropioCliente = async (req, res) => {
  try {
    const clienteId = req.session.usuario._id;

    const cliente = await Cliente.findById(clienteId).populate("plan").lean();
    if (!cliente) return res.status(404).send("Cliente no encontrado");

    if (cliente.plan?.precio) {
      cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
    }

    const historial = await obtenerHistorialFinanciero(cliente._id);

    res.render("clientesViews/historialCliente", {
      titulo: `Historial de ${cliente.nombre} ${cliente.apellido}`,
      cliente,
      historial,
    });
  } catch (error) {
    console.error("Error al mostrar historial del cliente autenticado:", error);
    res.status(500).send("Error al mostrar historial");
  }
};

export const mostrarHistorialDelClienteLogueado = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      dni: req.session.usuario.dni,
    })
      .populate("plan")
      .lean();

    if (!cliente) {
      return res.status(404).send("Cliente no encontrado");
    }

    if (cliente.plan?.precio) {
      cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
    }

    const historial = await obtenerHistorialFinanciero(cliente._id);

    res.render("clientesViews/verHistorialCliente", {
      titulo: `Mi Historial`,
      cliente,
      historial,
      usuario: req.session.usuario,
    });
  } catch (error) {
    console.error("Error al mostrar historial del cliente logueado:", error);
    res.status(500).send("Error interno del servidor");
  }
};
