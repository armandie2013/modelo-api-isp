import mongoose from "mongoose";

const notaCreditoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
  numeroDeComprobante: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  detalle: { type: String, default: "Nota de Crédito" },
  importe: { type: Number, required: true },
});

const NotaCredito = mongoose.model("NotaCredito", notaCreditoSchema);
export default NotaCredito;