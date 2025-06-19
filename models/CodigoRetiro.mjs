import mongoose from "mongoose";

const codigoRetiroSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  generadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  estado: {
    type: String,
    enum: ["activo", "usado", "anulado"],
    default: "activo",
  },
  importeDisponible: {
    type: Number,
    required: true,
  },
  fechaGeneracion: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 horas en segundos
  },
});

export default mongoose.model("CodigoRetiro", codigoRetiroSchema);