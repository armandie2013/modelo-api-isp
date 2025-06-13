import RetiroCobrador from '../models/RetiroCobrador.mjs';
import Cobro from '../models/Cobro.mjs';

export const registrarRetiro = async ({ cobradorId, adminId, importe, observacion }) => {
  // Guardamos el retiro
  const nuevoRetiro = new RetiroCobrador({
    cobrador: cobradorId,
    admin: adminId,
    importe,
    observacion
  });

  await nuevoRetiro.save();

  // Nota: No "borramos" cobros, solo usamos retiros para restar lógicamente

  return nuevoRetiro;
};

export const obtenerTotalRetirado = async (cobradorId) => {
  const retiros = await RetiroCobrador.find({ cobrador: cobradorId });
  return retiros.reduce((acc, r) => acc + r.importe, 0);
};