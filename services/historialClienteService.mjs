import Factura from "../models/Factura.mjs";
import Pago from "../models/Pago.mjs";
import Cobro from "../models/Cobro.mjs";
import NotaCredito from "../models/NotaCredito.mjs";
import NotaDebito from "../models/NotaDebito.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";

export const obtenerHistorialFinanciero = async (clienteId) => {
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const [facturas, cobros, notasCredito, notasDebito] = await Promise.all([
    Factura.find({
      cliente: clienteId,
      fecha: { $gte: seisMesesAtras },
    }).lean(),
    Cobro.find({ cliente: clienteId, fecha: { $gte: seisMesesAtras } }).lean(),
    NotaCredito.find({
      cliente: clienteId,
      fecha: { $gte: seisMesesAtras },
    }).lean(),
    NotaDebito.find({
      cliente: clienteId,
      fecha: { $gte: seisMesesAtras },
    }).lean(),
  ]);

  const movimientos = [];

  facturas.forEach((f) =>
    movimientos.push({
      tipo: "Factura",
      numero: f.numeroDeComprobante,
      fecha: f.fecha,
      detalle: f.detalle || "Factura por servicio",
      cargo: f.importe,
      pago: 0,
      _id: f._id,
    })
  );

  cobros.forEach((c) =>
    movimientos.push({
      tipo: "Pago",
      numero: c.numeroComprobante,
      fecha: c.fecha,
      detalle: c.detalle || "Pago realizado",
      cargo: 0,
      pago: c.totalCobrado, // ✅ este campo se usa en tu modelo Cobro
      _id: c._id,
    })
  );

  notasCredito.forEach((nc) =>
    movimientos.push({
      tipo: "Nota de Crédito",
      numero: nc.numeroDeComprobante,
      fecha: nc.fecha,
      detalle: nc.detalle || "Nota de Crédito",
      cargo: 0,
      pago: nc.importe,
      _id: nc._id,
    })
  );

  notasDebito.forEach((nd) =>
    movimientos.push({
      tipo: "Nota de Débito",
      numero: nd.numeroDeComprobante,
      fecha: nd.fecha,
      detalle: nd.detalle || "Nota de Débito",
      cargo: nd.importe,
      pago: 0,
      _id: nd._id,
    })
  );

  // Ordenar por fecha ascendente
  movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Calcular saldo acumulado y aplicar formato
  let saldo = 0;
  movimientos.forEach((mov) => {
    const cargo = typeof mov.cargo === "number" ? mov.cargo : 0;
    const pago = typeof mov.pago === "number" ? mov.pago : 0;

    saldo += cargo - pago;
    mov.saldo = saldo;

    // Formato para visualización
    mov.cargoFormateado = formatearMonedaARS(cargo);
    mov.pagoFormateado = formatearMonedaARS(pago);
    mov.saldoFormateado = formatearMonedaARS(saldo);

    // Formato de fecha
    mov.fechaFormateada = new Date(mov.fecha).toLocaleDateString("es-AR");
  });

  return movimientos;
};
