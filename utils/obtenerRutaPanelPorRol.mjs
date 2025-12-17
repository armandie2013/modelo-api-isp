export function obtenerRutaPanelPorRol(usuario) {
  if (!usuario) return "/login";


  const rol = usuario.rol || usuario.role;

  if (rol === "admin") return "/admin/cobranzas";        
  if (rol === "cobrador") return "/cobrador/panel";
  if (rol === "cliente") return "/cliente/panel";

  // fallback seguro
  return "/login";
}

export function obtenerLabelVolverPorRol(usuario) {
  if (!usuario) return "Volver";
  const rol = usuario.rol || usuario.role;
  if (rol === "admin") return "Volver al panel admin";
  if (rol === "cobrador") return "Volver al panel cobrador";
  if (rol === "cliente") return "Volver a mi panel";
  return "Volver";
}
