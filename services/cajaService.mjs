import Cobro from '../models/Cobro.mjs';
import RetiroCobrador from '../models/RetiroCobrador.mjs';

export const obtenerResumenCajaCobrador = async (cobradorId) => {
  const cobros = await Cobro.find({ cobrador: cobradorId }).populate("cliente", "nombre apellido").sort({fecha:-1});
  const retiros = await RetiroCobrador.find({ cobrador: cobradorId });

  const totalCobrado = cobros.reduce((acc, c) => acc + c.totalCobrado, 0);
  const totalRetirado = retiros.reduce((acc, r) => acc + r.importe, 0);
  const acumuladoActual = totalCobrado - totalRetirado;

  return {
    totalCobrado,
    totalRetirado,
    acumuladoActual,
    cobros,
    retiros
  };
};