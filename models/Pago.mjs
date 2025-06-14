import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
  numeroDeComprobante: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  importeTotal: { type: Number, required: true },
});

const Pago = mongoose.model("Pago", pagoSchema);
export default Pago;