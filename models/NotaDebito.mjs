import mongoose from "mongoose";

const notaDebitoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
  numeroDeComprobante: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  detalle: { type: String, default: "Nota de Débito" },
  importe: { type: Number, required: true },
});

const NotaDebito = mongoose.model("NotaDebito", notaDebitoSchema);
export default NotaDebito;