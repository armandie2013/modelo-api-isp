import mongoose from "mongoose";

const cajaAdminSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    unique: true,
  },
  acumuladoActual: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("CajaAdmin", cajaAdminSchema);