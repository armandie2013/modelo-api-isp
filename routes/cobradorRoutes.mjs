import express from 'express';
import { mostrarDashboardCobrador } from '../controllers/cobradorController.mjs';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';
import { verificarCobrador } from '../middlewares/verificarCobrador.mjs';

const router = express.Router();

router.get('/cobrador/dashboard', verificarSesion, verificarCobrador, mostrarDashboardCobrador);

export default router;