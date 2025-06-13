import Cobro from '../models/Cobro.mjs';
import { obtenerTotalRetirado } from '../services/retirosService.mjs';
import { registrarRetiro } from '../services/retirosService.mjs';
import { obtenerResumenCajaCobrador } from '../services/cajaService.mjs';

export const verPanelCobradorAdmin = async (req, res) => {
  try {
    const { idCobrador } = req.params;

    const resumen = await obtenerResumenCajaCobrador(idCobrador);

    res.render('adminViews/panelCobradorAdmin', {
      cobradorId: idCobrador,
      totalCobrado: resumen.totalCobrado,
      totalRetirado: resumen.totalRetirado,
      acumuladoActual: resumen.acumuladoActual,
      retiros: resumen.retiros
    });
  } catch (error) {
    console.error('Error al mostrar panel de cobrador:', error);
    res.status(500).render('errorGenerico', { mensaje: 'Error al cargar panel de cobrador.' });
  }
};

export const registrarRetiroController = async (req, res) => {
  try {
    const { cobradorId, importe, observacion } = req.body;
    const adminId = req.session.usuario._id;

    await registrarRetiro({
      cobradorId,
      adminId,
      importe: parseFloat(importe),
      observacion
    });

    res.redirect(`/admin/cobrador/${cobradorId}/panel`);
  } catch (error) {
    console.error('Error al registrar retiro:', error);
    res.status(500).render('errorGenerico', { mensaje: 'No se pudo registrar el retiro.' });
  }
};