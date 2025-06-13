import mongoose from 'mongoose';

const retiroCobradorSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  importe: {
    type: Number,
    required: true
  },
  observacion: {
    type: String
  }
});

export default mongoose.model('RetiroCobrador', retiroCobradorSchema);