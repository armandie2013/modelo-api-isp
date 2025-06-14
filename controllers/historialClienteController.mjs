import { obtenerHistorialFinanciero } from '../services/historialClienteService.mjs';
import Cliente from '../models/Cliente.mjs';

export const mostrarHistorialCliente = async (req, res) => {
  try {
    const clienteId = req.query.id || req.session.usuario?.id;

    if (!clienteId) {
      return res.status(400).render('errorGenerico', {
        titulo: 'Error',
        mensaje: 'Cliente no especificado.',
      });
    }

    const cliente = await Cliente.findById(clienteId);

    if (!cliente) {
      return res.status(404).render('errorGenerico', {
        titulo: 'Error',
        mensaje: 'Cliente no encontrado.',
      });
    }

    const historial = await obtenerHistorialFinanciero(clienteId);

    res.render('cobradorViews/historialCliente', {
      titulo: 'Historial Financiero',
      cliente,
      historial
    });

  } catch (error) {
    console.error('Error al mostrar historial del cliente:', error);
    res.status(500).render('errorGenerico', {
      titulo: 'Error',
      mensaje: 'Ocurrió un error al cargar el historial.',
    });
  }
};