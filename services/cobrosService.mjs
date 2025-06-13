import Cobro from '../models/Cobro.mjs';
import Cliente from '../models/Cliente.mjs';
import { obtenerSiguienteNumeroDeComprobante } from '../utils/obtenerSiguienteComprobante.mjs';

export const registrarCobro = async ({ clienteId, cobradorId, facturasSeleccionadas }) => {
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) throw new Error('Cliente no encontrado');

  const historial = cliente.historial || [];
  const facturasPagadas = [];
  let totalCobrado = 0;

  for (const factura of historial) {
    if (
      facturasSeleccionadas.includes(factura.numeroComprobante.toString()) &&
      !factura.pagado
    ) {
      facturasPagadas.push({
        numeroComprobante: factura.numeroComprobante,
        tipo: factura.tipo,
        detalle: factura.detalle,
        importe: factura.importe
      });
      totalCobrado += factura.importe;
      factura.pagado = true;
    }
  }

  if (facturasPagadas.length === 0) {
    throw new Error('No se seleccionaron facturas válidas para pagar.');
  }

  const numeroComprobante = await obtenerSiguienteNumeroDeComprobante();

  const nuevoCobro = new Cobro({
    numeroComprobante,
    cliente: clienteId,
    cobrador: cobradorId,
    facturasPagadas,
    totalCobrado
  });

  await nuevoCobro.save();
  await cliente.save(); // actualiza historial

  return nuevoCobro;
};

export const obtenerCobroPorId = async (id) => {
  return await Cobro.findById(id)
    .populate('cliente')
    .populate('cobrador');
};