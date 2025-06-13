import express from 'express';
import {
  registrarRetiroController,
  verPanelCobradorAdmin
} from '../controllers/retirosController.mjs';
import { verificarAdmin } from '../middlewares/verificarAdmin.mjs';


const router = express.Router();

router.post('/retiros/registrar', verificarAdmin, registrarRetiroController);
router.get('/admin/cobrador/:idCobrador/panel', verificarAdmin, verPanelCobradorAdmin);

export default router;