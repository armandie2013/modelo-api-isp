export const verificarCobrador = (req, res, next) => {
  if (req.session.usuario?.rol === 'cobrador') {
    return next();
  }

  return res.status(403).send('Acceso denegado: solo para cobradores');
};