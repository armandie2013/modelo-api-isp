export const mostrarDashboardCliente = (req, res) => {
  res.render('clienteViews/dashboardCliente', {
    titulo: 'Panel del Cliente',
    usuario: req.session.usuario,
  });
};