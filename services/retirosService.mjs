import crypto from 'crypto';
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from '../models/CodigoRetiro.mjs';

export const calcularRecaudadoActual = async (cobradorId) => {
  const cobros = await Cobro.find({ cobrador: cobradorId });
  const retiros = await RetiroCobrador.find({ cobrador: cobradorId });

  const totalCobrado = cobros.reduce((acc, c) => acc + c.totalCobrado, 0);
  const totalRetirado = retiros.reduce((acc, r) => acc + r.importe, 0);
  return totalCobrado - totalRetirado;
};

export const registrarRetiro = async ({ cobradorId, adminId, importe, observacion, creadoPor }) => {
  return await RetiroCobrador.create({
    cobrador: cobradorId,
    importe,
    observacion,
    creadoPor, // este es el usuario que hace el retiro (el admin)
    fecha: new Date(),
  });
};

export async function generarCodigoUnicoParaCobrador(cobradorId, adminId) {
  // Verificamos si ya existe un código activo
  const existe = await CodigoRetiro.findOne({ cobradorId, usado: false });
  if (existe) return null; // No se genera uno nuevo

  // Generar código alfanumérico de 6 caracteres
  const codigo = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 dígitos hex (ej: A1F3C9)

  const nuevoCodigo = new CodigoRetiro({
    codigo,
    cobradorId,
    creadoPor: adminId
  });

  await nuevoCodigo.save();
  return nuevoCodigo;
}