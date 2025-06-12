import express from 'express';
import { mostrarDashboardCliente } from '../controllers/clienteController.mjs';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';
import { verificarCliente } from '../middlewares/verificarCliente.mjs';

const router = express.Router();

router.get('/cliente/dashboard', verificarSesion, verificarCliente, mostrarDashboardCliente);

export default router;