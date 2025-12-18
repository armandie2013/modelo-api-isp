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

