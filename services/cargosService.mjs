import Cliente from '../models/Cliente.mjs';
import Plan from '../models/Plan.mjs';

export const generarCargosParaTodos = async () => {
  const clientes = await Cliente.find().populate('plan');

  const mesActual = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const ahora = new Date();
  const vencimiento = new Date(ahora);
  vencimiento.setDate(ahora.getDate() + 10);

  for (const cliente of clientes) {
    if (!cliente.plan) continue;

    cliente.historial.push({
      tipo: 'cargo',
      detalle: `Factura servicio - ${mesActual}`,
      fecha: ahora,
      vencimiento,
      importe: cliente.plan.precio
    });

    await cliente.save();
  }
};