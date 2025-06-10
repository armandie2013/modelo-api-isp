export const verificarSesion = (req, res, next) => {
  if (req.session.usuario) {
    res.locals.usuario = req.session.usuario;
  } else {
    res.locals.usuario = null;
  }
  next();
};