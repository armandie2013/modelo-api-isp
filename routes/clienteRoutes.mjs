import express from 'express';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';
import { mostrarHistorialDelClienteLogueado } from '../controllers/cobrosController.mjs';

const router = express.Router();

// Cliente ve su historial
router.get('/cliente/historial', verificarSesion, mostrarHistorialDelClienteLogueado);

export default router;