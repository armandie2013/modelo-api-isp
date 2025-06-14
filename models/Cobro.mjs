import mongoose from "mongoose";

const CobroSchema = new mongoose.Schema({
  numeroComprobante: {
    type: Number,
    required: true,
    unique: true
  },
  cliente: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Cliente",
  required: true
},
  cobrador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario", // o "Persona" si lo estás tomando desde otro modelo
    required: true
  },
  facturasPagadas: [
    {
      numeroComprobante: Number,
      tipo: String,
      detalle: String,
      importe: Number
    }
  ],
  totalCobrado: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const Cobro = mongoose.model("Cobro", CobroSchema);

export default Cobro;