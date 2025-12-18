// import Cliente from '../models/Cliente.mjs';
// import Plan from '../models/Plan.mjs';

// export const generarCargosParaTodos = async () => {
//   const clientes = await Cliente.find().populate('plan');

//   const mesActual = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
//   const ahora = new Date();
//   const vencimiento = new Date(ahora);
//   vencimiento.setDate(ahora.getDate() + 10);

//   for (const cliente of clientes) {
//     if (!cliente.plan) continue;

//     cliente.historial.push({
//       tipo: 'cargo',
//       detalle: `Factura servicio - ${mesActual}`,
//       fecha: ahora,
//       vencimiento,
//       importe: cliente.plan.precio
//     });

//     await cliente.save();
//   }
// };

import Cliente from '../models/Cliente.mjs';

export const generarCargosParaTodos = async () => {
  // ✅ SOLO ACTIVOS
  const clientes = await Cliente.find({ activo: true }).populate('plan');

  const ahora = new Date();

  // Mes actual “mes año” (como venías usando)
  const mesActual = ahora.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Vencimiento +10 días (igual que vos)
  const vencimiento = new Date(ahora);
  vencimiento.setDate(ahora.getDate() + 10);

  for (const cliente of clientes) {
    if (!cliente.plan) continue;

    // ✅ Evitar duplicado: si ya hay un cargo del mesActual, no lo vuelve a crear
    const yaExisteCargoMes = (cliente.historial || []).some(mov =>
      mov.tipo === 'cargo' && String(mov.detalle || '').includes(mesActual)
    );

    if (yaExisteCargoMes) continue;

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
