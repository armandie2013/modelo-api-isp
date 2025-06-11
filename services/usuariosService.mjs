import Usuario from '../models/Usuario.mjs';

export const actualizarRoles = async (cambios) => {
  const ids = Object.keys(cambios); // ['id1', 'id2', ...]

  for (const id of ids) {
    const nuevoRol = cambios[id];
    await Usuario.findByIdAndUpdate(id, { rol: nuevoRol });
  }
};

export const cambiarRolUsuario = async (usuarioId, nuevoRol) => {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  usuario.rol = nuevoRol;
  await usuario.save();

  return usuario;
};