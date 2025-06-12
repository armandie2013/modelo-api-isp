export const mostrarDashboardCobrador = (req, res) => {
  res.render("cobradorViews/dashboardCobrador", {
    titulo: "Panel del Cobrador",
    usuario: req.session.usuario,
  });
};
