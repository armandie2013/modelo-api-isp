import Usuario from '../models/Usuario.mjs';
import { actualizarRoles, cambiarRolUsuario } from '../services/usuariosService.mjs';

export const mostrarDashboardUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().lean();

    const admins = usuarios.filter(u => u.rol === 'admin');
    const cobradores = usuarios.filter(u => u.rol === 'cobrador');
    const clientes = usuarios.filter(u => u.rol === 'cliente');

    res.render('usuariosViews/dashboardUsuarios', {
      titulo: 'Gestión de Usuarios',
      admins,
      cobradores,
      clientes
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

export const mostrarFormularioEditarRol = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).lean();
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    res.render('usuariosViews/editarRol', {
      titulo: 'Editar Rol de Usuario',
      usuario,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
};

export const procesarEdicionRol = async (req, res) => {
  const { rol } = req.body;
  const usuarioId = req.params.id;

  try {
    await cambiarRolUsuario(usuarioId, rol);
    res.redirect('/usuarios/dashboard');
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).send('Error al actualizar el rol');
  }
};
