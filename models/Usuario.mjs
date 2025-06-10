import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dni: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    enum: ['admin', 'cobrador', 'cliente'],
    default: 'cobrador'
  },
  creadoEn: { type: Date, default: Date.now }
});

export default mongoose.model('Usuario', usuarioSchema);