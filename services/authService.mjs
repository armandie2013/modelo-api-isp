import Usuario from '../models/Usuario.mjs';
import bcrypt from 'bcrypt';

export const registrarUsuario = async (datos) => {
  const { nombre, apellido, email, dni, password } = datos;
  const cantidadUsuarios = await Usuario.countDocuments();
  const rol = cantidadUsuarios === 0 ? 'admin' : 'cliente';
  const passwordHasheada = await bcrypt.hash(password, 10);

  const nuevoUsuario = new Usuario({
    nombre,
    apellido,
    email,
    dni,
    password: passwordHasheada,
    rol
  });

  return await nuevoUsuario.save();
};

export const loginUsuario = async ({ email, password }) => {
  const usuario = await Usuario.findOne({ email });
  if (!usuario) throw new Error('Credenciales inválidas');

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) throw new Error('Credenciales inválidas');

  return usuario;
};