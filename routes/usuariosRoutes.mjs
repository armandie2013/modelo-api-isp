import express from 'express';
import {
  mostrarVistaCambioRoles,
  cambiarRolesUsuarios,
} from '../controllers/usuariosController.mjs';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';
import { verificarAdmin } from '../middlewares/verificarAdmin.mjs';

const router = express.Router();

router.get('/usuarios/cambiar-roles', verificarSesion, verificarAdmin, mostrarVistaCambioRoles);
router.post('/usuarios/cambiar-roles', verificarSesion, verificarAdmin, cambiarRolesUsuarios);

export default router;