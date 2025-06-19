import mongoose from "mongoose";

const cajaCobradorSchema = new mongoose.Schema({
  cobrador: {
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

export default mongoose.model("CajaCobrador", cajaCobradorSchema);