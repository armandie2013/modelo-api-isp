import CodigoRetiro from "../models/CodigoRetiro.mjs";
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";

// Función para calcular el saldo actual
async function obtenerImporteDisponible(cobradorId) {
  const cobros = await Cobro.find({ cobrador: cobradorId });
  const retiros = await RetiroCobrador.find({ creadoPor: cobradorId }); // ⚠️ Asegurate que sea creadoPor si así guardás el retiro

  const totalCobrado = cobros.reduce((acc, c) => acc + (c.totalCobrado || 0), 0);
  const totalRetirado = retiros.reduce((acc, r) => acc + (r.importe || 0), 0);

  return totalCobrado - totalRetirado;
}

// Función para generar un número de 6 dígitos
function generarCodigoAleatorio() {
  return Math.floor(100000 + Math.random() * 900000);
}

// 👉 FUNCIÓN PRINCIPAL
export async function generarCodigoUnicoParaCobrador(cobradorId, generadoPor) {
  // 👉 Paso 1: revisar si hay código activo
  const existente = await CodigoRetiro.findOne({
    cobrador: cobradorId,
    estado: "activo"
  });

  if (existente) return null; // ✅ Evita duplicados

  // 👉 Paso 2: calcular saldo actual
  const importeDisponible = await obtenerImporteDisponible(cobradorId);

  if (importeDisponible <= 0) return null; // ⚠️ No hay plata, no generes código

  // 👉 Paso 3: crear nuevo código
  const nuevoCodigo = new CodigoRetiro({
    cobrador: cobradorId,
    generadoPor,
    codigo: generarCodigoAleatorio(),
    estado: "activo",
    importeDisponible,
    fechaGeneracion: new Date(),
    expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24hs
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