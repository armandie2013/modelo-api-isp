import express from "express";
import { verificarSesion } from "../middlewares/verificarSesion.mjs";
import { mostrarPanelCliente } from "../controllers/clienteController.mjs";

const router = express.Router();

router.get("/cliente/panel", verificarSesion, mostrarPanelCliente);

export default router;