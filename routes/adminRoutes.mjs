import express from 'express';
import { mostrarDashboardAdmin } from '../controllers/adminController.mjs';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';
import { verificarAdmin } from '../middlewares/verificarAdmin.mjs';

const router = express.Router();

router.get('/admin/dashboard', verificarSesion, verificarAdmin, mostrarDashboardAdmin);

export default router;