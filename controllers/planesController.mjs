import Plan from "../models/Plan.mjs";

export const listarPlanes = async (req, res) => {
  try {
    const planes = await Plan.find().lean();
    res.render("planesViews/dashboardPlanes", {
      titulo: "Planes disponibles",
      planes,
    });
  } catch (error) {
    console.error("Error al listar planes:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const mostrarFormularioCrearPlan = (req, res) => {
  res.render("planesViews/crearPlan", {
    titulo: "Crear nuevo plan",
    errores: [],
    datos: {},
  });
};

export const procesarCreacionPlan = async (req, res) => {
  const { nombre, tipo, precio } = req.body;

  const errores = [];
  if (!nombre || !tipo || !precio)
    errores.push("Todos los campos son obligatorios");

  if (errores.length > 0) {
    return res.render("planesViews/crearPlan", {
      titulo: "Crear nuevo plan",
      errores,
      datos: req.body,
    });
  }

  try {
    const nuevoPlan = new Plan({ nombre, tipo, precio });
    await nuevoPlan.save();
    res.redirect("/planes/listado");
  } catch (error) {
    console.error("Error al guardar plan:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// Mostrar formulario de edición
export const mostrarFormularioEditarPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).lean();
    if (!plan) return res.status(404).send("Plan no encontrado");

    res.render("planesViews/editarPlan", {
      titulo: "Editar plan",
      errores: [],
      datos: plan,
    });
  } catch (error) {
    console.error("Error al obtener plan:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// Procesar edición
export const procesarEdicionPlan = async (req, res) => {
  const { nombre, tipo, precio } = req.body;
  const errores = [];

  if (!nombre || !tipo || !precio)
    errores.push("Todos los campos son obligatorios");

  if (errores.length > 0) {
    return res.render("planesViews/editarPlan", {
      titulo: "Editar plan",
      errores,
      datos: { ...req.body, _id: req.params.id },
    });
  }

  try {
    await Plan.findByIdAndUpdate(req.params.id, { nombre, tipo, precio });
    res.redirect("/planes/listado");
  } catch (error) {
    console.error("Error al editar plan:", error);
    res.status(500).send("Error al actualizar el plan");
  }
};

// Eliminar plan
export const eliminarPlan = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.redirect("/planes/listado");
  } catch (error) {
    console.error("Error al eliminar plan:", error);
    res.status(500).send("Error al eliminar el plan");
  }
};
