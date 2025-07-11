import mongoose from 'mongoose';

const pagoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  fecha: { type: Date, default: Date.now },
  importeTotal: { type: Number, required: true },
  numeroDeComprobante: { type: Number, required: true, unique: true },
  detalle: { type: String, default: 'Pago registrado' }
});

const Pago = mongoose.model('Pago', pagoSchema);

export default Pago;