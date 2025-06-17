import express from "express";
import {
  mostrarFormularioRetiro,
  procesarRetiro,
  procesarSolicitudRetiro,
  mostrarFormularioValidarCodigo,
  procesarRetiroConCodigo,
  generarCodigoRetiroController
} from "../controllers/retirosController.mjs";

import { verificarSesion } from "../middlewares/verificarSesion.mjs";
import { verificarAdmin } from "../middlewares/verificarAdmin.mjs";

const router = express.Router();

// Ruta para ver historial y formulario de retiro tradicional
router.get("/retiros", verificarSesion, mostrarFormularioRetiro);
router.post("/retiros/solicitar", verificarSesion, procesarSolicitudRetiro);

// Ruta para validar un código generado por admin
router.get("/retiros/validar-codigo", verificarSesion, mostrarFormularioValidarCodigo);
router.post("/retiros/procesar-retiro", verificarSesion, procesarRetiroConCodigo);

router.post('/retiros/generar-codigo', verificarSesion, verificarAdmin, generarCodigoRetiroController);

export default router;