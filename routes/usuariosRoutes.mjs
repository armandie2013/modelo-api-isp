import express from 'express';
import {
  mostrarVistaCambioRoles,
  cambiarRolesUsuarios,
  mostrarDashboardUsuarios,
  actualizarRolesUsuarios,
  mostrarFormularioEditarRol,
  procesarEdicionRol
} from '../controllers/usuariosController.mjs';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';
import { verificarAdmin } from '../middlewares/verificarAdmin.mjs';

const router = express.Router();

// Dashboard de usuarios
router.get('/usuarios/dashboard', verificarSesion, verificarAdmin, mostrarDashboardUsuarios);
router.post('/usuarios/actualizar-roles', verificarSesion, verificarAdmin, actualizarRolesUsuarios);

// Cambio de roles
router.get('/usuarios/cambiar-roles', verificarSesion, verificarAdmin, mostrarVistaCambioRoles);
router.post('/usuarios/cambiar-roles', verificarSesion, verificarAdmin, cambiarRolesUsuarios);

// Edición individual de rol
router.get('/usuarios/editar/:id', verificarSesion, verificarAdmin, mostrarFormularioEditarRol);
router.post('/usuarios/editar/:id', verificarSesion, verificarAdmin, procesarEdicionRol);

export default router;