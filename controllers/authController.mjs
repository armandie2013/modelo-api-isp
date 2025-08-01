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
    let mensajeError = "Ocurrió un error al registrar el usuario.";

    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        mensajeError = "El correo electrónico ya está registrado.";
      } else if (error.keyPattern && error.keyPattern.dni) {
        mensajeError = "El DNI ya está registrado.";
      }
    }

    res.render("authViews/registroUsuario", {
      titulo: "Registro de Usuario",
      errores: [mensajeError],
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
      _id: usuario._id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      dni: usuario.dni,
    };

    // Redirección según rol
    if (usuario.rol === "admin") {
      return res.redirect("/admin/cobranzas");
    } else if (usuario.rol === "cobrador") {
      return res.redirect("/cobrador/panel");
    } else if (usuario.rol === "cliente") {
      return res.redirect("/cliente/panel");
    } else {
      return res.redirect("/"); // fallback
    }

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
