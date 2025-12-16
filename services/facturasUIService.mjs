import Factura from "../models/Factura.mjs";
import Cobro from "../models/Cobro.mjs";

/**
 * Devuelve facturasUI: [{ factura... , pagos:[...] }]
 * - Cada pago viene de Cobro.facturasPagadas[] y se vincula por facturaId.
 */
export async function obtenerFacturasUI(clienteId, { meses = 6 } = {}) {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - meses);

  // 1) Facturas del cliente (últimos X meses)
  const facturas = await Factura.find({
    cliente: clienteId,
    fecha: { $gte: desde },
  })
    .sort({ fecha: -1 })
    .lean();

  const facturaIds = facturas.map((f) => String(f._id));
  const facturaIdSet = new Set(facturaIds);

  // 2) Cobros del cliente (últimos X meses) con facturasPagadas.facturaId
  const cobros = await Cobro.find({
    cliente: clienteId,
    fecha: { $gte: desde },
  })
    .sort({ fecha: -1 })
    .lean();

  // 3) Map facturaId -> pagos[]
  const pagosPorFactura = new Map();
  for (const c of cobros) {
    const items = Array.isArray(c.facturasPagadas) ? c.facturasPagadas : [];
    for (const fp of items) {
      const fid = fp?.facturaId ? String(fp.facturaId) : null;
      if (!fid || !facturaIdSet.has(fid)) continue;

      if (!pagosPorFactura.has(fid)) pagosPorFactura.set(fid, []);

      pagosPorFactura.get(fid).push({
        _id: c._id, // 👈 id del cobro para /cobros/:id/recibo
        numero: c.numeroComprobante,
        fecha: c.fecha,
        importe: Number(fp.importe || 0), // 👈 importe pagado de ESA factura dentro del cobro
      });
    }
  }

  // 4) facturasUI final
  const facturasUI = facturas.map((f) => {
    const fid = String(f._id);
    const pagos = (pagosPorFactura.get(fid) || [])
      .slice()
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const cargo = Number(f.importe || 0);
    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.importe || 0), 0);
    const pendiente = Math.max(0, cargo - totalPagado);

    return {
      _id: f._id,
      numero: f.numeroDeComprobante ?? f.numeroComprobante ?? "—",
      fecha: f.fecha,
      detalle: f.detalle || "—",
      cargo,
      pagos,
      totalPagado,
      pendiente,
      pagada: !!f.pagada,
    };
  });

  // Totales globales (afuera)
  const totalFacturado = facturasUI.reduce((a, f) => a + Number(f.cargo || 0), 0);
  const totalPagado = facturasUI.reduce((a, f) => a + Number(f.totalPagado || 0), 0);
  const totalAdeudado = facturasUI.reduce((a, f) => a + Number(f.pendiente || 0), 0);

  return { facturasUI, totalFacturado, totalPagado, totalAdeudado };
}
