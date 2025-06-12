import express from 'express';
import { conectarDB } from './config/database.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
import { verificarSesion } from './middlewares/verificarSesion.mjs';
import authRoutes from './routes/authRoutes.mjs';
import usuariosRoutes from './routes/usuariosRoutes.mjs';
import adminRoutes from './routes/adminRoutes.mjs';
import clienteRoutes from './routes/clienteRoutes.mjs';
import cobradorRoutes from './routes/cobradorRoutes.mjs'
import planesRoutes from './routes/planesRoutes.mjs';

dotenv.config();

// Helpers para __dirname con ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar app
const app = express();

// Conectar a MongoDB
conectarDB();

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // Usa views/layout.ejs por defecto
app.use(expressLayouts);

// Middlewares globales
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
  secret: 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));

// Middleware de sesión
app.use(verificarSesion);

// Rutas
app.use(authRoutes);
app.get('/', (req, res) => {
  res.render('inicio', { titulo: 'Inicio' });
});
app.use(usuariosRoutes);
app.use(adminRoutes);
app.use(clienteRoutes);
app.use(cobradorRoutes);
app.use(planesRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});