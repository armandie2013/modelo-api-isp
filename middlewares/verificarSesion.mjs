export const verificarSesion = (req, res, next) => {
  const rutasPublicas = ["/", "/login", "/registro", "/logout"];

  // Seguridad: si no existe req.session, evitar errores
  const sesion = req.session || {};

  // Rutas públicas siempre pasan
  if (rutasPublicas.includes(req.path)) {
    res.locals.usuario = sesion.usuario || null;
    return next();
  }

  // Si hay sesión válida, continuar
  if (sesion.usuario) {
    res.locals.usuario = sesion.usuario;
    return next();
  }

  // Si no hay sesión, mostrar mensaje y redirigir
  if (req.session) {
    req.flash("error", "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.");
  }

  return res.redirect("/login");
};