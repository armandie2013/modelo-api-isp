import express from "express";
import {
  mostrarFormularioCrearCliente,
  procesarCreacionCliente,
  mostrarFormularioEditarCliente,
  procesarEdicionCliente,
  eliminarCliente,
  mostrarDashboardClientes,
  mostrarHistorialCliente,
  generarCargosMensuales
} from "../controllers/clientesController.mjs";
import { verificarSesion } from "../middlewares/verificarSesion.mjs";
import { verificarAdmin } from "../middlewares/verificarAdmin.mjs";

const router = express.Router();

// Mostrar formulario de registro de cliente
router.get(
  "/clientes/crear",
  verificarSesion,
  verificarAdmin,
  mostrarFormularioCrearCliente
);

// Procesar registro de cliente
router.post(
  "/clientes/crear",
  verificarSesion,
  verificarAdmin,
  procesarCreacionCliente
);

router.get("/clientes/editar/:id",
  verificarSesion,
  verificarAdmin,
  mostrarFormularioEditarCliente
);
router.post(
  "/clientes/editar/:id",
  verificarSesion,
  verificarAdmin,
  procesarEdicionCliente
);

router.post(
  "/clientes/eliminar/:id",
  verificarSesion,
  verificarAdmin,
  eliminarCliente
);

router.get(
  "/clientes/dashboard",
  verificarSesion,
  verificarAdmin,
  mostrarDashboardClientes
);

router.get(
"/clientes/:id/historial",
verificarSesion,
mostrarHistorialCliente);

router.post(
  "/clientes/generar-cargos",
  verificarSesion,
  verificarAdmin,
  generarCargosMensuales
);

export default router;
