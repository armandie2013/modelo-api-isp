import cron from "node-cron";
import { generarCargosParaTodos } from "../services/cargosService.mjs";

export const iniciarCronCargosMensuales = () => {
  // ⏰ Día 28 de cada mes a las 02:00 AM
  cron.schedule("0 2 28 * *", async () => {
    try {
      console.log("⏳ [CRON] Generando cargos mensuales (clientes activos)");

      await generarCargosParaTodos();

      console.log("✅ [CRON] Cargos generados correctamente");
    } catch (error) {
      console.error("❌ [CRON] Error al generar cargos:", error);
    }
  });

  console.log("🕒 Cron de cargos mensuales inicializado (día 28)");
};
