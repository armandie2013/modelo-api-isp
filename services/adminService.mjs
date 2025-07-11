import RetiroCobrador from "../models/RetiroCobrador.mjs";
import Factura from "../models/Factura.mjs";
import dayjs from "dayjs";

export const obtenerTotalRetirosConfirmados = async () => {
  try {
    const retiros = await RetiroCobrador.find({});

    const total = retiros.reduce((acc, retiro) => {
      return acc + (retiro.importe || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error("Error al calcular total de retiros:", error);
    return 0;
  }
};

export const obtenerRecaudacionRealDelMesActual = async () => {
  try {
    const inicioMes = dayjs().startOf("month").toDate();
    const finMes = dayjs().endOf("month").toDate();

    const facturasPagadas = await Factura.find({
      pagada: true,
      fechaPago: { $gte: inicioMes, $lte: finMes }
    });

    const total = facturasPagadas.reduce((acc, factura) => {
      return acc + (factura.importe || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error("Error al calcular recaudación del mes:", error);
    return 0;
  }
};