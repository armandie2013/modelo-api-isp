import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
import flash from 'connect-flash';

import { conectarDB } from './config/database.mjs';
import { verificarSesion } from './middlewares/verificarSesion.mjs';

// 📦 Rutas principales del sistema
import authRoutes from './routes/authRoutes.mjs';
import usuariosRoutes from './routes/usuariosRoutes.mjs';
import adminRoutes from './routes/adminRoutes.mjs';
import clienteRoutes from './routes/clienteRoutes.mjs';
import cobradorRoutes from './routes/cobradorRoutes.mjs';
import planesRoutes from './routes/planesRoutes.mjs';
import clientesRoutes from './routes/clientesRoutes.mjs';
import adminCobranzasRoutes from "./routes/adminCobranzasRoutes.mjs";

// 🧾 Rutas para módulo financiero (cobros/retiros)
import cobrosRoutes from './routes/cobrosRoutes.mjs';
import retirosRoutes from './routes/retirosRoutes.mjs';

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

// Middleware para procesar datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 👉 Configuración de sesión
app.use(session({
  secret: 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 5, // 5 minutos
  }),
  cookie: {
    maxAge: 5 * 60 * 1000, // 5 minutos
    httpOnly: true,
    secure: false,
  },
}));

// 👉 Evita modificación de sesión en rutas públicas si no hay login
app.use((req, res, next) => {
  const rutasQueNoNecesitanSesion = ["/", "/login", "/registro"];
  if (!req.session?.usuario && rutasQueNoNecesitanSesion.includes(req.path)) {
    return next(); // No tocar nada de la sesión
  }
  next();
});

// 👉 Configuración de flash segura (solo si hay sesión activa con usuario)
app.use(flash());
app.use((req, res, next) => {
  if (req.session?.usuario) {
    res.locals.mensajesFlash = req.flash();
  } else {
    res.locals.mensajesFlash = {};
  }
  next();
});

// 👉 Middleware de sesión (agrega usuario a res.locals si existe)
app.use(verificarSesion);

// 👉 Middleware temporal para evitar errores por falta de 'titulo'
app.use((req, res, next) => {
  if (typeof res.locals.titulo === 'undefined') {
    res.locals.titulo = 'Sistema ISP (sin título)';
  }
  next();
});

// 👉 Rutas del sistema
app.use(authRoutes);
app.use(usuariosRoutes);
app.use(adminRoutes);
app.use(clienteRoutes);
app.use(cobradorRoutes);
app.use(planesRoutes);
app.use(clientesRoutes);
app.use(adminCobranzasRoutes);
app.use(retirosRoutes);
app.use(cobrosRoutes);  // También tiene retiros combinados

// Página de inicio
app.get('/', (req, res) => {
  res.render('inicio', { titulo: 'Inicio' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});