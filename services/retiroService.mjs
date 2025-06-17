import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";

export async function verificarCodigoRetiroYCrearRetiro({ codigo, importe, cobradorId }) {
  // Verificamos si el código existe, está activo y corresponde al cobrador
  const codigoEncontrado = await CodigoRetiro.findOne({ codigo, estado: "activo", cobrador: cobradorId });

  if (!codigoEncontrado) {
    throw new Error("Código inválido o ya fue usado.");
  }

  // Comprobamos que el importe solicitado no sea mayor al permitido
  if (importe > codigoEncontrado.importeDisponible) {
    throw new Error("El importe excede el monto permitido por el administrador.");
  }

  // Creamos el retiro
  const retiro = await RetiroCobrador.create({
    cobrador: cobradorId,
    importe,
    fecha: new Date(),
    codigo: codigoEncontrado.codigo,
  });

  // Marcamos el código como usado
  codigoEncontrado.estado = "usado";
  await codigoEncontrado.save();

  return retiro;
}