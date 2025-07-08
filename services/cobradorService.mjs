import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import Usuario from "../models/Usuario.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";

export async function obtenerResumenCobrador(cobradorId) {
  console.log("🔍 Buscando cobrador con ID:", cobradorId);
  const cobrador = await Usuario.findById(cobradorId);
  console.log("📄 Resultado de búsqueda:", cobrador);

  const [cobros, retiros] = await Promise.all([
    Cobro.find({ cobrador: cobradorId }).populate("cliente").sort({ fecha: 1 }),
    RetiroCobrador.find({ creadoPor: cobradorId }).sort({ fecha: 1 }),
  ]);

  const movimientos = [];

  cobros.forEach((mov) => {
    const importe = mov.totalCobrado ?? mov.importe ?? 0;

    movimientos.push({
      tipo: "Cobro",
      numero: mov.numeroComprobante || "-",
      fecha: mov.fecha,
      detalle: `Cobro a ${mov.cliente?.nombre} ${mov.cliente?.apellido || ""}`, // 👈 nombre del cliente
      cargo: importe > 0 ? importe : 0,
      pago: 0,
    });
  });

  retiros.forEach((mov) => {
    const importe = mov.importe ?? 0;

    movimientos.push({
      tipo: "Retiro",
      numero: mov.numeroDeComprobante || "-",
      fecha: mov.fecha,
      detalle: mov.detalle || "Retiro de caja",
      cargo: 0,
      pago: importe,
    });
  });

  // Ordenar por fecha
  movimientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Calcular totales y saldo acumulado
  let totalCobrado = 0;
  let totalRetirado = 0;
  let saldo = 0;

  const historial = movimientos.map((mov) => {
    totalCobrado += mov.cargo;
    totalRetirado += mov.pago;
    saldo += mov.cargo - mov.pago;

    return {
      fecha: mov.fecha.toLocaleDateString("es-AR"),
      numero: mov.numero,
      tipo: mov.tipo,
      detalle: mov.detalle,
      cargo: mov.cargo,
      pago: mov.pago,
      saldo,
      cliente: mov.cliente || null, // 👈 asegurate de incluir esto
    };
  });

  const format = (valor) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  // Solo mostrar el código activo (si hay uno)
  const codigoActivo = await CodigoRetiro.findOne({
    cobrador: cobradorId,
    estado: "activo",
  }).sort({ creadoEn: -1 });

  const codigoExpirado = codigoActivo
    ? new Date() >
      new Date(codigoActivo.fechaGeneracion.getTime() + 24 * 60 * 60 * 1000)
    : false;

  const saldoFormateado = format(saldo);

  const ultimaFechaRetiro =
    retiros.length > 0
      ? new Date(retiros[retiros.length - 1].fecha).toLocaleDateString("es-AR")
      : null;

  return {
    cobrador,
    totalCobrado,
    totalRetirado,
    saldo,
    historial,
    totalCobradoFormateado: format(totalCobrado - totalRetirado),
    saldoFormateado,
    ultimaFechaRetiro,
    codigoGenerado: codigoActivo?.codigo || null,
    codigoExpirado,
  };
}
