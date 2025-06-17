import mongoose from "mongoose";

const codigoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  generadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  asignadoA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  utilizado: {
    type: Boolean,
    default: false,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CodigoAutorizacion", codigoSchema);