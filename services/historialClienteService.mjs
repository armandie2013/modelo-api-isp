import Factura from '../models/Factura.mjs';
import Pago from '../models/Pago.mjs';
import NotaCredito from '../models/NotaCredito.mjs';
import NotaDebito from '../models/NotaDebito.mjs';

export const obtenerHistorialFinanciero = async (clienteId) => {
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  // Buscar comprobantes
  const [facturas, pagos, notasCredito, notasDebito] = await Promise.all([
    Factura.find({ cliente: clienteId, fecha: { $gte: seisMesesAtras } }),
    Pago.find({ cliente: clienteId, fecha: { $gte: seisMesesAtras } }),
    NotaCredito.find({ cliente: clienteId, fecha: { $gte: seisMesesAtras } }),
    NotaDebito.find({ cliente: clienteId, fecha: { $gte: seisMesesAtras } })
  ]);

  const movimientos = [];

  facturas.forEach(f => movimientos.push({
    tipo: 'Factura',
    numero: f.numeroDeComprobante,
    fecha: f.fecha,
    detalle: f.detalle || 'Factura por servicio',
    cargo: f.importe,
    pago: 0
  }));

  pagos.forEach(p => movimientos.push({
    tipo: 'Pago',
    numero: p.numeroDeComprobante,
    fecha: p.fecha,
    detalle: 'Pago realizado',
    cargo: 0,
    pago: p.importeTotal
  }));

  notasCredito.forEach(nc => movimientos.push({
    tipo: 'Nota de Crédito',
    numero: nc.numeroDeComprobante,
    fecha: nc.fecha,
    detalle: nc.detalle || 'Nota de Crédito',
    cargo: 0,
    pago: nc.importe
  }));

  notasDebito.forEach(nd => movimientos.push({
    tipo: 'Nota de Débito',
    numero: nd.numeroDeComprobante,
    fecha: nd.fecha,
    detalle: nd.detalle || 'Nota de Débito',
    cargo: nd.importe,
    pago: 0
  }));

  // Ordenar por fecha ascendente
  movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Calcular saldo acumulado
  let saldo = 0;
  movimientos.forEach(mov => {
    saldo += mov.cargo - mov.pago;
    mov.saldo = saldo;
  });

  return movimientos;
};
