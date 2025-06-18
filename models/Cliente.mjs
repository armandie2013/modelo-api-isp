import mongoose from 'mongoose';

const historialSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['cargo', 'pago', 'notaCredito', 'notaDebito'],
    required: true,
  },
  detalle: String,
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
  vencimiento: Date,
  importe: {
    type: Number,
    required: true,
  }
}, { _id: true });

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  dni: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  direccion: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  historial: [historialSchema]
}, {
  timestamps: true
});

export default mongoose.model('Cliente', clienteSchema);