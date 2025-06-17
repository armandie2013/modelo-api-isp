import express from "express";
import {
  mostrarPanelAdminCobranzas,
  mostrarPanelAdminComoCobrador,
  mostrarPanelCobradorDesdeAdmin
} from "../controllers/adminCobranzasController.mjs";
import { verificarSesion } from "../middlewares/verificarSesion.mjs";
import { verificarAdmin } from "../middlewares/verificarAdmin.mjs";

const router = express.Router();

// Rutas para el panel de administración de cobranzas
router.get("/admin/cobranzas", verificarSesion, verificarAdmin, mostrarPanelAdminCobranzas);
router.get("/admin/mi-panel-cobrador", verificarSesion, verificarAdmin, mostrarPanelAdminComoCobrador);
router.get("/admin/cobrador/:id/panel", verificarSesion, verificarAdmin, mostrarPanelCobradorDesdeAdmin);

export default router;