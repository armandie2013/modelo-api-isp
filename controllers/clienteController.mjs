// import Cliente from "../models/Cliente.mjs";
// import { obtenerHistorialFinanciero } from "../services/historialClienteService.mjs";
// import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

// export async function mostrarPanelCliente(req, res) {
//   try {
//     // console.log("Usuario logueado:", req.session.usuario);
//     const cliente = await Cliente.findOne({ dni: req.session.usuario.dni })
//       .populate("plan")
//       .lean();

//     if (!cliente) {
//       return res.status(404).render("errorGenerico", {
//         titulo: "Error",
//         mensaje: "Cliente no encontrado.",
//       });
//     }

//     // Formateo del precio del plan
//     if (cliente.plan?.precio) {
//       cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
//     }

//     const historial = await obtenerHistorialFinanciero(cliente._id);

//     res.render("clienteViews/panelCliente", { cliente, historial });
//   } catch (error) {
//     console.error("Error al cargar el panel del cliente:", error);
//     res.status(500).send("Error al cargar los datos del cliente");
//   }
// }


// import Cliente from "../models/Cliente.mjs";
// import { obtenerHistorialFinanciero } from "../services/historialClienteService.mjs";
// import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

// export async function mostrarPanelCliente(req, res) {
//   try {
//     const usuario = req.session.usuario;
//     if (!usuario) return res.redirect("/login");

//     const cliente = await Cliente.findOne({ dni: usuario.dni })
//       .populate("plan")
//       .lean();

//     if (!cliente) {
//       return res.status(404).render("errorGenerico", {
//         titulo: "Error",
//         mensaje: "Cliente no encontrado.",
//       });
//     }

//     // Precio plan formateado
//     if (cliente.plan?.precio != null) {
//       cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
//     }

//     // Historial tipo "banco"
//     const historial = await obtenerHistorialFinanciero(cliente._id);

//     // ✅ Orden más nuevo primero
//     const historialOrdenado = (historial || [])
//       .slice()
//       .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

//     // ✅ Convertir a "facturasUI" (cards por factura)
//     // Cada factura contiene pagos asociados (los pagos van "dentro")
//     const facturasMap = new Map();

//     // 1) crear facturas
//     for (const item of historialOrdenado) {
//       if ((item.tipo || "").toLowerCase() === "factura" || Number(item.cargo || 0) > 0) {
//         const key = String(item.numero || item._id);

//         facturasMap.set(key, {
//           _id: item._id,
//           numero: item.numero,
//           fecha: item.fecha,
//           detalle: item.detalle,
//           cargo: Number(item.cargo || 0),
//           cargoFormateado: item.cargoFormateado || formatearMonedaARS(Number(item.cargo || 0)),
//           pagos: [],
//         });
//       }
//     }

//     // 2) meter pagos dentro (si no existe factura, igual la creamos como "sin detalle")
//     for (const item of historialOrdenado) {
//       if ((item.tipo || "").toLowerCase() === "pago" || Number(item.pago || 0) > 0) {
//         // ⚠️ Si tu service trae una referencia a factura, usala acá (ej: item.facturaNumero o item.facturaId)
//         // Si NO tenés referencia, el sistema NO puede saber qué pago corresponde a qué factura.
//         // En ese caso, lo que hacemos es mostrar "Pagos sueltos" dentro de una pseudo-factura "Pagos" (o lo ajustamos).

//         const key = item.facturaNumero ? String(item.facturaNumero) : null;

//         if (key && facturasMap.has(key)) {
//           facturasMap.get(key).pagos.push({
//             _id: item._id,
//             numero: item.numero,
//             fecha: item.fecha,
//             importe: Number(item.pago || 0),
//             importeFormateado: item.pagoFormateado || formatearMonedaARS(Number(item.pago || 0)),
//             reciboUrl: `/cobros/${item._id}/recibo`,
//           });
//         } else {
//           // fallback: pagos sin factura asociada (para no perder info)
//           const fallbackKey = "__pagos_sueltos__";
//           if (!facturasMap.has(fallbackKey)) {
//             facturasMap.set(fallbackKey, {
//               _id: null,
//               numero: "—",
//               fecha: null,
//               detalle: "Pagos registrados",
//               cargo: 0,
//               cargoFormateado: formatearMonedaARS(0),
//               pagos: [],
//             });
//           }
//           facturasMap.get(fallbackKey).pagos.push({
//             _id: item._id,
//             numero: item.numero,
//             fecha: item.fecha,
//             importe: Number(item.pago || 0),
//             importeFormateado: item.pagoFormateado || formatearMonedaARS(Number(item.pago || 0)),
//             reciboUrl: `/cobros/${item._id}/recibo`,
//           });
//         }
//       }
//     }

//     // 3) array final
//     const facturasUI = Array.from(facturasMap.values())
//       .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

//     // ✅ total adeudado (afuera)
//     const totalAdeudado = facturasUI.reduce((acc, f) => {
//       const totalPagado = (f.pagos || []).reduce((s, p) => s + Number(p.importe || 0), 0);
//       return acc + Math.max(0, Number(f.cargo || 0) - totalPagado);
//     }, 0);

//     res.render("clienteViews/panelCliente", {
//       titulo: "Panel del Cliente",
//       cliente,
//       facturasUI,
//       totalAdeudado,
//       totalAdeudadoFormateado: formatearMonedaARS(totalAdeudado),
//     });

//   } catch (error) {
//     console.error("Error al cargar el panel del cliente:", error);
//     res.status(500).send("Error al cargar los datos del cliente");
//   }
// }

import Cliente from "../models/Cliente.mjs";
import Factura from "../models/Factura.mjs";
import Cobro from "../models/Cobro.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

export async function mostrarPanelCliente(req, res) {
  try {
    const usuario = req.session.usuario;
    if (!usuario) return res.redirect("/login");

    const cliente = await Cliente.findOne({ dni: usuario.dni })
      .populate("plan")
      .lean();

    if (!cliente) {
      return res.status(404).render("errorGenerico", {
        titulo: "Error",
        mensaje: "Cliente no encontrado.",
      });
    }

    if (cliente.plan?.precio != null) {
      cliente.plan.precioFormateado = formatearMonedaARS(cliente.plan.precio);
    }

    // 1) Facturas del cliente (más nuevo primero)
    const facturas = await Factura.find({ cliente: cliente._id })
      .sort({ fecha: -1 })
      .lean();

    // 2) Cobros del cliente (más nuevo primero)
    const cobros = await Cobro.find({ cliente: cliente._id })
      .sort({ fecha: -1 })
      .lean();

    // 3) Index: facturaId -> pagos[]
    // Cada pago sale desde Cobro.facturasPagadas[] usando fp.facturaId + fp.importe
    const pagosPorFactura = new Map();

    for (const c of cobros) {
      const fps = Array.isArray(c.facturasPagadas) ? c.facturasPagadas : [];

      for (const fp of fps) {
        const facturaId = fp?.facturaId ? String(fp.facturaId) : null;
        if (!facturaId) continue; // si falta facturaId, no se puede asociar

        if (!pagosPorFactura.has(facturaId)) pagosPorFactura.set(facturaId, []);

        pagosPorFactura.get(facturaId).push({
          _id: c._id, // id del cobro -> sirve para /cobros/:id/recibo
          numero: c.numeroComprobante ?? "—",
          fecha: c.fecha,
          importe: Number(fp.importe || 0), // ✅ importe de ESTA factura dentro del cobro
          importeFormateado: formatearMonedaARS(Number(fp.importe || 0)),
          reciboUrl: `/cobros/${c._id}/recibo`,
        });
      }
    }

    // 4) facturasUI
    const facturasUI = facturas.map((f) => {
      const facturaId = String(f._id);

      const pagos = (pagosPorFactura.get(facturaId) || [])
        .slice()
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      const cargo = Number(f.importe ?? 0);
      const cargoFormateado = f.importeFormateado || formatearMonedaARS(cargo);

      const totalPagosFactura = pagos.reduce((acc, p) => acc + Number(p.importe || 0), 0);
      const pendiente = Math.max(0, cargo - totalPagosFactura);

      return {
        _id: f._id,
        numero: f.numeroDeComprobante ?? f.numeroComprobante ?? "—",
        fecha: f.fecha,
        detalle: f.detalle || "Factura por servicio",
        cargo,
        cargoFormateado,
        pagos,
        totalPagosFactura,
        totalPagosFacturaFormateado: formatearMonedaARS(totalPagosFactura),
        pendiente,
        pendienteFormateado: formatearMonedaARS(pendiente),
        pagada: !!f.pagada,
      };
    });

    // 5) Totales afuera
    const totalFacturado = facturasUI.reduce((acc, f) => acc + Number(f.cargo || 0), 0);
    const totalPagado = facturasUI.reduce((acc, f) => acc + Number(f.totalPagosFactura || 0), 0);
    const totalAdeudado = facturasUI.reduce((acc, f) => acc + Number(f.pendiente || 0), 0);

    return res.render("clienteViews/panelCliente", {
      titulo: "Panel del Cliente",
      usuario,
      cliente,
      facturasUI,

      totalFacturado,
      totalPagado,
      totalAdeudado,

      totalFacturadoFormateado: formatearMonedaARS(totalFacturado),
      totalPagadoFormateado: formatearMonedaARS(totalPagado),
      totalAdeudadoFormateado: formatearMonedaARS(totalAdeudado),
    });
  } catch (error) {
    console.error("Error al cargar el panel del cliente:", error);
    return res.status(500).send("Error al cargar los datos del cliente");
  }
}
