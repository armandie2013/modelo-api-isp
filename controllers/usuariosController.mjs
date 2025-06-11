import Usuario from '../models/Usuario.mjs';
import { actualizarRoles } from '../services/usuariosService.mjs';

export const mostrarDashboardUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('usuariosViews/dashboardUsuarios', {
      titulo: 'Gestión de Usuarios',
      usuarios
    });
  } catch (error) {
    console.error('Error al mostrar usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
};

export const actualizarRolesUsuarios = async (req, res) => {
  try {
    const cambios = req.body.roles; // { id1: 'admin', id2: 'cliente', ... }
    await actualizarRoles(cambios);
    res.redirect('/usuarios/dashboard');
  } catch (error) {
    console.error('Error al actualizar roles:', error);
    res.status(500).send('No se pudieron actualizar los roles');
  }
};

// GET /usuarios/cambiar-roles
export const mostrarVistaCambioRoles = async (req, res) => {
  try {
    const usuarios = await Usuario.find().lean();
    res.render('usuariosViews/cambiarRoles', {
      titulo: 'Cambiar roles de usuarios',
      usuarios,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// POST /usuarios/cambiar-roles
export const cambiarRolesUsuarios = async (req, res) => {
  try {
    await actualizarRoles(req.body);
    const usuarios = await Usuario.find().lean();
    res.render('usuariosViews/cambiarRoles', {
      titulo: 'Cambiar roles de usuarios',
      usuarios,
      exito: true
    });
  } catch (error) {
    console.error('Error al actualizar roles:', error);
    res.status(500).send('Error al actualizar roles');
  }
};