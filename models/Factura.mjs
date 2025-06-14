import mongoose from "mongoose";

const facturaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
  numeroDeComprobante: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  detalle: { type: String, default: "Factura por servicio" },
  importe: { type: Number, required: true },
});

const Factura = mongoose.model("Factura", facturaSchema);
export default Factura;