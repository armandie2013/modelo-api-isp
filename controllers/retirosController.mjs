import Cobro from '../models/Cobro.mjs';
import { registrarRetiro, generarCodigoUnicoParaCobrador } from '../services/retirosService.mjs';
import { obtenerResumenCajaCobrador } from '../services/cajaService.mjs';
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";
import CodigoAutorizacion from "../models/CodigoAutorizacion.mjs";
import { calcularRecaudadoActual } from "../services/retirosService.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";


export const verPanelCobradorAdmin = async (req, res) => {
  try {
    const { idCobrador } = req.params;

    // 1. Resumen de caja
    const resumen = await obtenerResumenCajaCobrador(idCobrador);

    // 2. Buscar código activo (no usado aún)
    const codigoActivo = await CodigoRetiro.findOne({
      cobradorId: idCobrador,
      usado: false
    });

    res.render('adminViews/panelCobradorAdmin', {
      cobradorId: idCobrador,
      totalCobrado: resumen.totalCobrado,
      totalRetirado: resumen.totalRetirado,
      acumuladoActual: resumen.acumuladoActual,
      retiros: resumen.retiros,
      codigoGenerado: codigoActivo?.codigo || null
    });

  } catch (error) {
    console.error('Error al mostrar panel de cobrador:', error);
    res.status(500).render('errorGenerico', {
      mensaje: 'Error al cargar panel de cobrador.'
    });
  }
};

export const registrarRetiroController = async (req, res) => {
  try {
    const { cobradorId, importe, observacion } = req.body;
    const adminId = req.session.usuario._id;

    await registrarRetiro({
      cobradorId,
      adminId,
      importe: parseFloat(importe),
      observacion,
      creadoPor: adminId
    });

    res.redirect(`/admin/cobrador/${cobradorId}/panel`);
  } catch (error) {
    console.error('Error al registrar retiro:', error);
    res.status(500).render('errorGenerico', { mensaje: 'No se pudo registrar el retiro.' });
  }
};

export const mostrarFormularioRetiro = async (req, res) => {
  try {
    const cobradorId = req.session.usuario._id;

    const retiros = await RetiroCobrador.find({ cobrador: cobradorId }).sort({ fecha: -1 });

    // Calculás la recaudación acumulada (sin contar lo ya retirado)
    const totalCobrado = await RetiroCobrador.aggregate([
      { $match: { cobrador: cobradorId } },
      { $group: { _id: null, total: { $sum: "$importe" } } }
    ]);

    // En este paso vos podés calcular el `montoDisponible` como necesites.
    const montoDisponible = req.session.montoDisponible || 0; // O desde otro origen si ya lo calculás

    res.render("cobradorViews/solicitarRetiro", {
      montoFormateado: formatearMonedaARS(montoDisponible),
      retiros,
      mensajeExito: req.flash("exito"),
      mensajeError: req.flash("error"),
    });

  } catch (error) {
    console.error("Error al mostrar formulario de retiro:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "No se pudo cargar la vista de retiro.",
    });
  }
};

export const procesarRetiro = async (req, res) => {
  const { importe, codigo } = req.body;
  const cobradorId = req.session.usuario._id;

  try {
    const totalDisponible = await calcularRecaudadoActual(cobradorId);

    const codigoEncontrado = await CodigoAutorizacion.findOne({
      codigo,
      asignadoA: cobradorId,
      utilizado: false,
    });

    if (!codigoEncontrado) {
      return res.render("cobradorViews/crearRetiro", {
        titulo: "Generar Retiro",
        totalRecaudado: totalDisponible,
        error: "Código inválido o ya utilizado.",
      });
    }

    if (importe > totalDisponible) {
      return res.render("cobradorViews/crearRetiro", {
        titulo: "Generar Retiro",
        totalRecaudado: totalDisponible,
        error: "No puedes retirar más de lo recaudado.",
      });
    }

    // Marcar código como usado
    codigoEncontrado.utilizado = true;
    await codigoEncontrado.save();

    // Crear retiro
    await RetiroCobrador.create({
      cobrador: cobradorId,
      importe,
      codigoAutorizacion: codigo,
      utilizado: true,
    });

    res.redirect("/cobrador/panel");
  } catch (error) {
    console.error("Error al procesar retiro:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "No se pudo procesar el retiro.",
    });
  }
};

export const procesarSolicitudRetiro = async (req, res) => {
  try {
    const cobradorId = req.session.usuario._id;
    const { codigo } = req.body;

    // Buscar código en la base de datos
    const codigoEncontrado = await CodigoRetiro.findOne({ codigo, usado: false, usuario: cobradorId });

    if (!codigoEncontrado) {
      req.flash("error", "El código ingresado no es válido o ya fue utilizado.");
      return res.redirect("/retiros");
    }

    // Registrar retiro
    const nuevoRetiro = await RetiroCobrador.create({
      importe: codigoEncontrado.monto,
      codigo: codigo,
      cobrador: cobradorId,
      fecha: new Date(),
    });

    // Marcar código como usado
    codigoEncontrado.usado = true;
    await codigoEncontrado.save();

    req.flash("exito", `Retiro registrado por ${formatearMonedaARS(codigoEncontrado.monto)}`);
    res.redirect("/retiros");
  } catch (error) {
    console.error("Error al procesar el retiro:", error);
    req.flash("error", "Ocurrió un error al procesar el retiro.");
    res.redirect("/retiros");
  }
};

export const mostrarFormularioValidarCodigo = (req, res) => {
  res.render("cobradorViews/validarCodigo", {
    titulo: "Validar Código de Retiro",
    mensajeError: req.flash("error"),
    mensajeExito: req.flash("exito"),
  });
};

export const procesarRetiroConCodigo = async (req, res) => {
  try {
    const { codigo } = req.body;
    const cobradorId = req.session.usuario._id;

    const codigoEncontrado = await CodigoAutorizacion.findOne({
      codigo,
      asignadoA: cobradorId,
      utilizado: false,
    });

    if (!codigoEncontrado) {
      req.flash("error", "El código ingresado no es válido o ya fue utilizado.");
      return res.redirect("/retiros/validar-codigo");
    }

    // Guardar en sesión el monto disponible
    req.session.montoDisponible = codigoEncontrado.monto;
    req.session.codigoAutorizacion = codigo;
    req.flash("exito", `Código validado. Monto disponible: ${formatearMonedaARS(codigoEncontrado.monto)}`);
    res.redirect("/retiros");
  } catch (error) {
    console.error("Error al validar código de retiro:", error);
    req.flash("error", "Ocurrió un error al validar el código.");
    res.redirect("/retiros/validar-codigo");
  }
};

export const generarCodigoRetiroController = async (req, res) => {
  try {
    const { cobradorId } = req.body;
    const adminId = req.session.usuario._id;

    const nuevoCodigo = await generarCodigoUnicoParaCobrador(cobradorId, adminId);

    if (!nuevoCodigo) {
      req.flash('error', 'Ya existe un código activo para este cobrador.');
    } else {
      req.flash('success', `Código generado: ${nuevoCodigo.codigo}`);
    }

    res.redirect(`/admin/cobrador/${cobradorId}/panel`);
  } catch (error) {
    console.error('Error generando código de retiro:', error);
    req.flash('error', 'No se pudo generar el código.');
    res.redirect('/');
  }
};