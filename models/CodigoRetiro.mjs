import mongoose from "mongoose";

const codigoRetiroSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  estado: {
    type: String,
    enum: ["activo", "usado"],
    default: "activo"
  },
  importeDisponible: {
    type: Number,
    required: true
  },
  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario", // o "Cobrador" si cambiás el nombre del modelo
    required: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario", // el admin que lo creó
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("CodigoRetiro", codigoRetiroSchema);