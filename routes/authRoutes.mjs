import express from 'express';
import {
  mostrarFormularioRegistro,
  procesarRegistro,
  mostrarFormularioLogin,
  procesarLogin,
  cerrarSesion
} from '../controllers/authController.mjs';

const router = express.Router();

router.get('/registro', mostrarFormularioRegistro);
router.post('/registro', procesarRegistro);

router.get('/login', mostrarFormularioLogin);
router.post('/login', procesarLogin);

router.post('/logout', cerrarSesion);

export default router;