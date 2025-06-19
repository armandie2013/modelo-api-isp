import Cobro from '../models/Cobro.mjs';
import RetiroCobrador from '../models/RetiroCobrador.mjs';

export const obtenerResumenCajaCobrador = async (cobradorId) => {
  const cobros = await Cobro.find({ cobrador: cobradorId })
    .populate("cliente", "nombre apellido")
    .sort({ fecha: -1 });

  const retiros = await RetiroCobrador.find({ creadoPor: cobradorId })
    .sort({ fecha: -1 });

  const ultimosCobros = cobros.slice(0, 5).map(c => ({
    fecha: c.fecha,
    numeroComprobante: c.numeroComprobante || "",
    cliente: `${c.cliente?.nombre || ""} ${c.cliente?.apellido || ""}`,
    importe: c.totalCobrado,
    idComprobante: c._id.toString(),
  }));

  const movimientos = [
    ...cobros.map(c => ({
      tipo: "Cobro",
      detalle: `${c.cliente?.nombre || ""} ${c.cliente?.apellido || ""}`,
      importe: c.totalCobrado,
      fecha: c.fecha,
      numeroComprobante: c.numeroComprobante || "",
      idComprobante: c._id.toString(),
    })),
    ...retiros.map(r => ({
      tipo: "Retiro",
      detalle: `Retiro autorizado por código ${r.codigoAutorizacion}`,
      importe: -r.importe,
      fecha: r.fecha,
      numeroComprobante: "Retiro",
      idComprobante: null,
    }))
  ];

  movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const acumuladoActual = movimientos.reduce((acc, m) => acc + m.importe, 0);

  return {
    movimientos,
    acumuladoActual,
    ultimosCobros
  };
};