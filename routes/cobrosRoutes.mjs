import express from 'express';
import {
  mostrarFormularioBusqueda,
  procesarBusquedaCliente,
  procesarCobro,
  mostrarRecibo,
  mostrarPanelCobrador
} from '../controllers/cobrosController.mjs';
import { verificarSesion } from '../middlewares/verificarSesion.mjs';

const router = express.Router();

router.get('/cobrador/panel', verificarSesion, mostrarPanelCobrador);
router.get('/cobros/buscar', verificarSesion, mostrarFormularioBusqueda);
router.get('/cobros/buscar-cliente', verificarSesion, procesarBusquedaCliente);
router.post('/cobros/registrar', verificarSesion, procesarCobro);
router.get('/cobros/:id/recibo', verificarSesion, mostrarRecibo);

export default router;