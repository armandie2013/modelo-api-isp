import mongoose from "mongoose";
import Cobro from "../models/Cobro.mjs";
import { obtenerSiguienteNumeroDeComprobante } from "../utils/obtenerSiguienteComprobante.mjs";
import Factura from "../models/Factura.mjs";

export const registrarCobro = async (datos) => {
  const { clienteId, cobradorId, facturas } = datos;
  console.log("🧩 Datos recibidos en servicio:", datos);
  // 1. Calcular total
  const total = facturas.reduce((sum, f) => sum + f.importe, 0);

  // 2. Obtener número de comprobante
  const numero = await obtenerSiguienteNumeroDeComprobante();

  // 3. Crear documento de cobro
  if (!cobradorId) {
  throw new Error("❌ cobradorId no está definido");
}
  console.log("✅ Datos recibidos en registrarCobro:");
console.log("clienteId:", clienteId);
console.log("cobradorId:", cobradorId);
console.log("facturas.length:", facturas.length);
console.log("typeof cobradorId:", typeof cobradorId);
console.log("¿Es ObjectId?", mongoose.Types.ObjectId.isValid(cobradorId));
  const nuevoCobro = new Cobro({
    numeroComprobante: numero,
    cliente: clienteId,
    cobrador: cobradorId,
    facturasPagadas: facturas.map(f => ({
      numeroComprobante: f.numeroDeComprobante,
      tipo: f.tipo || "factura",
      detalle: f.detalle,
      importe: f.importe
    })),
    totalCobrado: total
  });

  await nuevoCobro.save();

  // 4. Actualizar las facturas como pagadas
  await Factura.updateMany(
  { _id: { $in: facturas.map(f => f._id) } },
  {
    $set: {
      pagada: true,
      fechaPago: new Date(),
      pagadoEn: nuevoCobro._id
    }
  }
);

  return nuevoCobro;
};

export const obtenerCobroPorId = async (id) => {
  return Cobro.findById(id)
    .populate("cliente", "nombre apellido dni")
    .lean();
};