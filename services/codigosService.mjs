import CodigoRetiro from "../models/CodigoRetiro.mjs";
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";

// 👉 Función para calcular el importe disponible
async function obtenerImporteDisponible(cobradorId) {
  const cobros = await Cobro.find({ cobrador: cobradorId });
  const retiros = await RetiroCobrador.find({ cobrador: cobradorId });

  const totalCobrado = cobros.reduce((acc, c) => acc + c.totalCobrado, 0);
  const totalRetirado = retiros.reduce((acc, r) => acc + r.importe, 0);

  return totalCobrado - totalRetirado;
}

// 👉 Función para generar un código aleatorio único
function generarCodigoAleatorio() {
  return Math.floor(100000 + Math.random() * 900000); // 6 dígitos
}

export async function generarCodigoUnicoParaCobrador(cobradorId, generadoPor) {
  // Verificar si ya existe un código activo para ese cobrador
  const existente = await CodigoRetiro.findOne({ cobrador: cobradorId, estado: "activo" });
  if (existente) return null;

  const importeDisponible = await obtenerImporteDisponible(cobradorId);

  const nuevoCodigo = new CodigoRetiro({
    cobrador: cobradorId,
    generadoPor,
    codigo: generarCodigoAleatorio(),
    estado: "activo",
    importeDisponible,
  });

  return await nuevoCodigo.save();
}

/**
 * Verifica si un código de retiro es válido (activo y no vencido)
 */
export async function validarCodigoDeRetiro(codigoIngresado, cobradorId) {
  const codigo = await CodigoRetiro.findOne({
    codigo: codigoIngresado,
    cobrador: cobradorId,
    estado: "activo",
  });

  if (!codigo) return { valido: false, mensaje: "Código inválido o ya utilizado." };

  const ahora = new Date();
  const expirado = (ahora - codigo.fechaGeneracion) > 24 * 60 * 60 * 1000;

  if (expirado) {
    return { valido: false, mensaje: "Código expirado." };
  }

  return { valido: true, codigo };
}