import mongoose from "mongoose";

const retiroSchema = new mongoose.Schema({
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  codigoAutorizacion: { type: String, required: true },
  importe: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model("RetiroCobrador", retiroSchema);