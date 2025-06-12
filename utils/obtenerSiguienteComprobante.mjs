import Contador from "../models/Contador.mjs";

export const obtenerSiguienteNumeroDeComprobante = async () => {
  const contador = await Contador.findOneAndUpdate(
    { nombre: "comprobante" },
    { $inc: { ultimoNumero: 1 } },
    { new: true, upsert: true }
  );
  return contador.ultimoNumero;
};