export const verificarCliente = (req, res, next) => {
  if (req.session.usuario?.rol === 'cliente') {
    return next();
  }

  return res.status(403).send('Acceso denegado: solo para clientes');
};