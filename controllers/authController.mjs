import { registrarUsuario, loginUsuario } from "../services/authService.mjs";

export const mostrarFormularioRegistro = (req, res) => {
  res.render("authViews/registroUsuario", {
    titulo: "Registro de Usuario",
    errores: [],
    datos: {},
  });
};

export const procesarRegistro = async (req, res) => {
  const { password, confirmarPassword } = req.body;

  // Validar coincidencia de contraseñas
  if (password !== confirmarPassword) {
    return res.render("authViews/registroUsuario", {
      titulo: "Registro de Usuario",
      errores: ["Las contraseñas no coinciden"],
      datos: req.body,
    });
  }

  try {
    await registrarUsuario(req.body);
    res.redirect("/login");
  } catch (error) {
    res.render("authViews/registroUsuario", {
      titulo: "Registro de Usuario",
      errores: [error.message],
      datos: req.body,
    });
  }
};

export const mostrarFormularioLogin = (req, res) => {
  res.render("authViews/login", {
    titulo: "Iniciar sesión",
    errores: [],
    datos: {},
  });
};

export const procesarLogin = async (req, res) => {
  try {
    const usuario = await loginUsuario(req.body);
    req.session.usuario = {
      id: usuario._id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      dni: usuario.dni,
    };
    res.redirect("/");
  } catch (error) {
    res.render("authViews/login", {
      errores: [error.message],
      datos: req.body,
    });
  }
};

export const cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
