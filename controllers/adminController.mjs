export const mostrarDashboardAdmin = (req, res) => {
  res.render('adminViews/dashboardAdmin', {
    titulo: 'Panel de Administración',
  });
};