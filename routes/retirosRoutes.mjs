import express from "express";
import {
  mostrarFormularioRetiro,
  mostrarFormularioValidarCodigo, // Paso 1: mostrar input para el código
  procesarRetiroConCodigo,       // Paso 1: procesar el código, guardar en sesión y redirigir a /retiros/confirmar
  mostrarFormularioConfirmarRetiro, // Paso 2: mostrar datos del retiro (importe + admin) y confirmar
  confirmarRetiroUnificado,      // Paso 2: registrar retiro y redirigir
  generarCodigoRetiroController
} from "../controllers/retirosController.mjs";

import { verificarSesion } from "../middlewares/verificarSesion.mjs";
import { verificarAdmin } from "../middlewares/verificarAdmin.mjs";

const router = express.Router();

// Paso 0: Panel historial del cobrador
router.get("/retiros", verificarSesion, mostrarFormularioRetiro);

// Paso 1: Validar código de retiro
router.get("/retiros/validar-codigo", verificarSesion, mostrarFormularioValidarCodigo);
router.post("/retiros/procesar-retiro", verificarSesion, procesarRetiroConCodigo);

// Paso 2: Mostrar pantalla de confirmación
router.get("/retiros/confirmar", verificarSesion, mostrarFormularioConfirmarRetiro);
router.post("/retiros/confirmar-retiro", verificarSesion, confirmarRetiroUnificado);

// Admin: generar código de retiro
router.post("/retiros/generar-codigo", verificarSesion, verificarAdmin, generarCodigoRetiroController);

export default router;