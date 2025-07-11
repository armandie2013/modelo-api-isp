import mongoose from 'mongoose';

const facturaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  fecha: { type: Date, required: true },
  detalle: { type: String, required: true },
  importe: { type: Number, required: true },
  numeroDeComprobante: { type: Number, required: true, unique: true },
  pagada: { type: Boolean, default: false },
  fechaPago: { type: Date, default: null}
});

const Factura = mongoose.model('Factura', facturaSchema);

export default Factura;