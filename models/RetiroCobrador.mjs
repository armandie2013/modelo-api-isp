import mongoose from "mongoose";

const retiroCobradorSchema = new mongoose.Schema({
  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  importe: {
    type: Number,
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  codigoAutorizacion: {
    type: String,
    required: true,
    unique: true, // Evita reutilización del código
  },
  utilizado: {
    type: Boolean,
    default: false,
  },
  creadoPor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Usuario",
  required: true,
},
});

export default mongoose.model("RetiroCobrador", retiroCobradorSchema);