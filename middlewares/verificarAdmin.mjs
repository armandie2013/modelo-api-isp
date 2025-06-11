export const verificarAdmin = (req, res, next) => {
  if (req.session.usuario?.rol === 'admin') {
    return next();
  }

  return res.status(403).send('Acceso denegado');
};