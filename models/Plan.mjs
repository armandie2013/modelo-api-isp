import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  precio: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);