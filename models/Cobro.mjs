import mongoose from 'mongoose';

const cobroSchema = new mongoose.Schema({
  numeroComprobante: {
    type: Number,
    required: true,
    unique: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // o 'Persona' según cómo tengas definido al cobrador
    required: true
  },
  facturasPagadas: [
    {
      numeroComprobante: Number,
      tipo: String, // "factura", "nota de débito", etc.
      detalle: String,
      importe: Number
    }
  ],
  totalCobrado: {
    type: Number,
    required: true
  }
});

export default mongoose.model('Cobro', cobroSchema);