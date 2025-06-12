import express from "express";
import {
  mostrarFormularioCrearPlan,
  procesarCreacionPlan,
  mostrarFormularioEditarPlan,
  procesarEdicionPlan,
  eliminarPlan,
  listarPlanes
} from "../controllers/planesController.mjs";
import { verificarSesion } from "../middlewares/verificarSesion.mjs";
import { verificarAdmin } from "../middlewares/verificarAdmin.mjs";

const router = express.Router();

router.get(
  "/planes/listado",
  verificarSesion,
  verificarAdmin,
  listarPlanes
);

router.get(
  "/planes/crear",
  verificarSesion,
  verificarAdmin,
  mostrarFormularioCrearPlan
);
router.post(
  "/planes/crear",
  verificarSesion,
  verificarAdmin,
  procesarCreacionPlan
);

router.get(
  "/planes/editar/:id",
  verificarSesion,
  verificarAdmin,
  mostrarFormularioEditarPlan
);
router.post(
  "/planes/editar/:id",
  verificarSesion,
  verificarAdmin,
  procesarEdicionPlan
);
router.post(
  "/planes/eliminar/:id",
  verificarSesion,
  verificarAdmin,
  eliminarPlan
);

export default router;
