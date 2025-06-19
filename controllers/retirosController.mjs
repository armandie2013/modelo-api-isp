import { registrarRetiro } from "../services/retirosService.mjs";
import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";
import Usuario from "../models/Usuario.mjs";
import { calcularRecaudadoActual } from "../services/retirosService.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";
import { generarCodigoUnicoParaCobrador } from "../services/codigosService.mjs";
import CajaCobrador from "../models/CajaCobrador.mjs";
import CajaAdmin from "../models/CajaAdmin.mjs";
import { obtenerSiguienteNumeroDeComprobante } from "../utils/obtenerSiguienteComprobante.mjs";

export const verPanelCobradorAdmin = async (req, res) => {
  try {
    const { idCobrador } = req.params;

    // 1. Resumen de caja
    const resumen = await obtenerResumenCajaCobrador(idCobrador);

    // 2. Buscar código activo (no usado aún)
    const codigoActivo = await CodigoRetiro.findOne({
      cobradorId: idCobrador,
      usado: false,
    });

    res.render("adminViews/panelCobradorAdmin", {
      cobradorId: idCobrador,
      totalCobrado: resumen.totalCobrado,
      totalRetirado: resumen.totalRetirado,
      acumuladoActual: resumen.acumuladoActual,
      retiros: resumen.retiros,
      codigoGenerado: codigoActivo?.codigo || null,
    });
  } catch (error) {
    console.error("Error al mostrar panel de cobrador:", error);
    res.status(500).render("errorGenerico", {
      mensaje: "Error al cargar panel de cobrador.",
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
      creadoPor: adminId,
    });

    res.redirect(`/admin/cobrador/${cobradorId}/panel`);
  } catch (error) {
    console.error("Error al registrar retiro:", error);
    res
      .status(500)
      .render("errorGenerico", { mensaje: "No se pudo registrar el retiro." });
  }
};

export const mostrarFormularioRetiro = async (req, res) => {
  try {
    const cobradorId = req.session.usuario._id;

    const retiros = await RetiroCobrador.find({ cobrador: cobradorId }).sort({
      fecha: -1,
    });

    // Calculás la recaudación acumulada (sin contar lo ya retirado)
    const totalCobrado = await RetiroCobrador.aggregate([
      { $match: { cobrador: cobradorId } },
      { $group: { _id: null, total: { $sum: "$importe" } } },
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
  const cobradorId = req.session.usuario._id;
  const codigo = req.session.codigoAutorizacion;
  const importe = req.session.montoDisponible;

  try {
    const totalDisponible = await calcularRecaudadoActual(cobradorId);

    if (!codigo || !importe) {
      req.flash("error", "No hay un código válido en sesión.");
      return res.redirect("/retiros/validar-codigo");
    }

    const codigoEncontrado = await CodigoAutorizacion.findOne({
      codigo,
      asignadoA: cobradorId,
      utilizado: false,
    });

    if (!codigoEncontrado) {
      req.flash(
        "error",
        "El código ingresado no es válido o ya fue utilizado."
      );
      return res.redirect("/retiros/validar-codigo");
    }

    if (importe > totalDisponible) {
      req.flash("error", "El importe a retirar excede el total recaudado.");
      return res.redirect("/retiros");
    }

    // Marcar el código como utilizado
    codigoEncontrado.utilizado = true;
    await codigoEncontrado.save();

    // Registrar el retiro
    await RetiroCobrador.create({
      cobrador: cobradorId,
      importe,
      codigoAutorizacion: codigo,
      utilizado: true,
    });

    // Limpiar sesión
    delete req.session.montoDisponible;
    delete req.session.codigoAutorizacion;

    req.flash(
      "exito",
      `Retiro de ${formatearMonedaARS(importe)} realizado con éxito.`
    );
    res.redirect("/retiros");
  } catch (error) {
    console.error("Error al procesar retiro:", error);
    req.flash("error", "Ocurrió un error al procesar el retiro.");
    res.redirect("/retiros");
  }
};

export const procesarSolicitudRetiro = async (req, res) => {
  try {
    const cobradorId = req.session.usuario._id;
    const { codigo } = req.body;

    // Buscar código en la base de datos
    const codigoEncontrado = await CodigoRetiro.findOne({
      codigo,
      usado: false,
      usuario: cobradorId,
    });

    if (!codigoEncontrado) {
      req.flash(
        "error",
        "El código ingresado no es válido o ya fue utilizado."
      );
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

    req.flash(
      "exito",
      `Retiro registrado por ${formatearMonedaARS(codigoEncontrado.monto)}`
    );
    res.redirect("/retiros");
  } catch (error) {
    console.error("Error al procesar el retiro:", error);
    req.flash("error", "Ocurrió un error al procesar el retiro.");
    res.redirect("/retiros");
  }
};

// Mostrar el formulario para ingresar el código de retiro
export const mostrarFormularioValidarCodigo = (req, res) => {
  res.render("cobradorViews/validarCodigo", {
    titulo: "Validar Código de Retiro",
    mensajeError: req.flash("error"),
    mensajeExito: req.flash("exito"),
    montoDisponible: null,
    codigoAutorizacion: null,
  });
};

// Procesar código ingresado y mostrar monto disponible si es válido
export const procesarRetiroConCodigo = async (req, res) => {
  try {
    const { codigo } = req.body;
    const cobradorId = req.session.usuario._id;

    console.log("🔍 Código recibido:", codigo);

    const codigoValido = await CodigoRetiro.findOne({
      codigo,
      cobrador: cobradorId,
      estado: "activo",
    });

    if (!codigoValido) {
      req.flash("error", "Código inválido o expirado.");
      return res.redirect("/retiros/validar-codigo");
    }

    // Obtener info del admin que generó el código
    const admin = await Usuario.findById(codigoValido.generadoPor);

    if (!admin) {
      req.flash(
        "error",
        "No se pudo encontrar al administrador que generó el código."
      );
      return res.redirect("/retiros/validar-codigo");
    }

    const monto = codigoValido.importeDisponible;

    // Guardamos en sesión para usar en el POST siguiente
    req.session.codigoAutorizacion = codigo;
    req.session.montoDisponible = monto;

    res.render("cobradorViews/confirmarRetiro", {
      montoFormateado: formatearMonedaARS(monto),
      adminNombre: `${admin.nombre} ${admin.apellido}`,
      codigoAutorizacion: codigo,
    });
  } catch (error) {
    console.error("🔥 Error al validar código de retiro:", error);
    req.flash("error", "Error procesando el código.");
    res.redirect("/retiros/validar-codigo");
  }
};

export const generarCodigoRetiroController = async (req, res) => {
  try {
    const { cobradorId } = req.body;
    const adminId = req.session.usuario._id;

    const nuevoCodigo = await generarCodigoUnicoParaCobrador(
      cobradorId,
      adminId
    );

    if (!nuevoCodigo) {
      req.flash("error", "Ya existe un código activo para este cobrador.");
    } else {
      req.flash("success", `Código generado: ${nuevoCodigo.codigo}`);
    }

    res.redirect(`/admin/cobrador/${cobradorId}/panel`);
  } catch (error) {
    console.error("Error generando código de retiro:", error);
    req.flash("error", "No se pudo generar el código.");
    res.redirect("/");
  }
};

export async function confirmarRetiroUnificado(req, res) {
  try {
    const codigo = String(req.body.codigo).trim();
    const cobradorId = req.session.usuario._id;

    console.log("🔍 Código recibido:", codigo);

    // Buscar código activo
    const codigoDoc = await CodigoRetiro.findOne({ codigo, estado: "activo" });
    if (!codigoDoc) {
      return res.status(400).send("Código inválido o ya utilizado.");
    }

    // Registrar el retiro en la colección RetiroCobrador
    await RetiroCobrador.create({
      creadoPor: cobradorId,
      codigoAutorizacion: codigo,
      importe: codigoDoc.importeDisponible,
      fecha: new Date()
    });

    // Marcar el código como "usado"
    codigoDoc.estado = "usado";
    await codigoDoc.save();

    console.log("✅ Retiro registrado correctamente.");

    res.redirect("/cobrador/panel");
  } catch (error) {
    console.warn("🔥 Error al confirmar retiro:", error);
    res.status(500).send("Error al confirmar retiro.");
  }
}

export const mostrarFormularioConfirmarRetiro = async (req, res) => {
  try {
    const { montoDisponible, codigoAutorizacion } = req.session;

    if (!montoDisponible || !codigoAutorizacion) {
      req.flash(
        "error",
        "Debe validar un código antes de confirmar el retiro."
      );
      return res.redirect("/retiros/validar-codigo");
    }

    // Buscar datos del código para mostrar el nombre del admin
    const codigoEncontrado = await CodigoRetiro.findOne({
      codigo: codigoAutorizacion,
    });

    if (!codigoEncontrado) {
      req.flash("error", "Código no encontrado.");
      return res.redirect("/retiros/validar-codigo");
    }

    // Buscar datos del admin que generó el código
    const admin = await Usuario.findById(codigoEncontrado.generadoPor);

    res.render("cobradorViews/confirmarRetiro", {
      montoFormateado: formatearMonedaARS(montoDisponible),
      adminNombre: admin?.nombre || "Administrador",
      codigoAutorizacion,
    });
  } catch (error) {
    console.error("Error al mostrar formulario de confirmación:", error);
    req.flash("error", "Error al mostrar la confirmación.");
    res.redirect("/retiros/validar-codigo");
  }
};
