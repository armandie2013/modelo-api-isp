import mongoose from "mongoose";
import Usuario from "../models/Usuario.mjs";
import Cobro from "../models/Cobro.mjs";
import RetiroCobrador from "../models/RetiroCobrador.mjs";
import CodigoRetiro from "../models/CodigoRetiro.mjs";
import Factura from "../models/Factura.mjs";
import Retiro from "../models/RetiroCobrador.mjs";
import { formatearMonedaARS } from "../utils/formatearMoneda.mjs";
import { obtenerResumenCajaCobrador } from "../services/cajaService.mjs";
import { obtenerResumenCobrador } from "../services/cobradorService.mjs";
import { obtenerTotalRetirosConfirmados } from "../services/adminService.mjs";
import { obtenerRecaudacionRealDelMesActual } from "../services/adminService.mjs";


export const mostrarPanelAdminCobranzas = async (req, res) => {
  try {
    const totalRetiros = await obtenerTotalRetirosConfirmados();
const recaudacionRealMes = await obtenerRecaudacionRealDelMesActual(); // <- MOVIDA AQUÍ

const saldoDisponible = recaudacionRealMes - totalRetiros;

const totalRetirosFormateado = formatearMonedaARS(totalRetiros);
const recaudacionRealFormateada = formatearMonedaARS(recaudacionRealMes);
const saldoDisponibleFormateado = formatearMonedaARS(saldoDisponible);
    

    const cobradores = await Usuario.find({ rol: "cobrador" });

    const cobradoresConDatos = await Promise.all(
      cobradores.map(async (cobrador) => {
        const resumen = await obtenerResumenCobrador(cobrador._id);

        return {
          _id: cobrador._id,
          nombre: cobrador.nombre,
          apellido: cobrador.apellido,
          email: cobrador.email,
          montoRecaudadoFormateado: resumen.saldoFormateado,
          ultimaFechaRetiro: resumen.ultimaFechaRetiro || "Sin retiros"
        };
      })
    );

    const facturas = await Factura.find().lean();
    const recaudacionesPorMes = {};

    facturas.forEach(factura => {
      const fecha = new Date(factura.fecha);
      const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

      if (!recaudacionesPorMes[key]) {
        recaudacionesPorMes[key] = {
          total: 0,
          mes: fecha.toLocaleString("es-AR", { month: "long" }),
          anio: fecha.getFullYear(),
        };
      }

      recaudacionesPorMes[key].total += factura.importe;
    });

    const tarjetasRecaudacion = Object.entries(recaudacionesPorMes).map(
      ([key, val]) => ({
        key,
        mes: val.mes.charAt(0).toUpperCase() + val.mes.slice(1),
        anio: val.anio,
        total: formatearMonedaARS(val.total),
      })
    ).sort((a, b) => new Date(`${a.anio}-${a.key.split('-')[1]}-01`) - new Date(`${b.anio}-${b.key.split('-')[1]}-01`));

    
    

    res.render("adminViews/panelAdminCobranzas", {
      titulo: "Panel de Cobranzas",
      cobradores: cobradoresConDatos,
      tarjetasRecaudacion,
      totalRetirosFormateado,
      recaudacionRealFormateada,
      saldoDisponibleFormateado
    });

  } catch (error) {
    console.error("Error al mostrar el panel del administrador de cobranzas:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Hubo un problema al cargar el panel de cobranzas.",
    });
  }
};

export const mostrarPanelCobradorDesdeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const resumen = await obtenerResumenCobrador(id);

    // Validación: Si no existe el cobrador, mostrar error
    if (!resumen.cobrador) {
      return res.status(404).render("errorGenerico", {
        titulo: "Cobrador no encontrado",
        mensaje: "El cobrador especificado no existe.",
      });
    }

    res.render("adminViews/panelCobradorDesdeAdmin", {
      titulo:"Panel Cobrador",
      cobrador: resumen.cobrador,
      totalCobradoFormateado: resumen.totalCobradoFormateado,
      totalRetiradoFormateado: resumen.totalRetiradoFormateado,
      saldoFormateado: resumen.saldoFormateado,
      historial: resumen.historial,
      codigoGenerado: resumen.codigoGenerado,
      codigoExpirado: resumen.codigoExpirado,
    });

  } catch (error) {
    console.error("Error al mostrar el panel del cobrador desde admin:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "Ocurrió un problema al cargar el panel del cobrador.",
    });
  }
};

export const mostrarPanelAdminComoCobrador = async (req, res) => {
  try {
    console.log("ID recibido:", idCobrador);
    const adminId = req.session.usuario._id;

    const resumen = await obtenerResumenCajaCobrador(adminId);

    const cobros = await Cobro.find({ cobrador: adminId })
      .populate("cliente")
      .sort({ fecha: -1 });

    const cobrosFormateados = cobros.map((c) => ({
      ...c.toObject(),
      importeFormateado: formatearMonedaARS(c.totalCobrado),
      fechaFormateada: new Date(c.fecha).toLocaleDateString("es-AR"),
    }));

    res.render("adminViews/panelAdminCobrador", {
      titulo: "Mi Panel como Cobrador",
      cobros: cobrosFormateados,
      totalCobrado: formatearMonedaARS(resumen.totalCobrado),
      totalRetirado: formatearMonedaARS(resumen.totalRetirado),
      montoTotal: formatearMonedaARS(resumen.acumuladoActual),
    });
  } catch (error) {
    console.error("Error al cargar panel del admin como cobrador:", error);
    res.status(500).render("errorGenerico", {
      titulo: "Error",
      mensaje: "No se pudo cargar el panel.",
    });
  }
};
