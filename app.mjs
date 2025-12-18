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

import { iniciarCronCargosMensuales } from "./cron/cargosMensuales.cron.mjs";

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

// =====================================================
// 1) Configuración del motor de vistas + estáticos
// =====================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// 2) Parsers
// =====================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================================================
// 3) Sesión + flash
// =====================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 30, // 30 minutos
  }),
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutos
    httpOnly: true,
    secure: false,
  },
}));

// 👉 Evita modificación de sesión en rutas públicas si no hay login
app.use((req, res, next) => {
  const rutasPublicas = ["/", "/login", "/registro"];
  if (!req.session?.usuario && rutasPublicas.includes(req.path)) {
    return next();
  }
  next();
});

// Flash (solo si hay sesión)
app.use(flash());
app.use((req, res, next) => {
  res.locals.mensajesFlash = req.session?.usuario ? req.flash() : {};
  next();
});

// =====================================================
// 4) Middleware global de sesión + defaults
// =====================================================
app.use(verificarSesion);

app.use((req, res, next) => {
  if (typeof res.locals.titulo === 'undefined') {
    res.locals.titulo = 'Sistema ISP (sin título)';
  }
  next();
});

// =====================================================
// 5) Rutas del sistema
// =====================================================
app.use(authRoutes);
app.use(usuariosRoutes);
app.use(adminRoutes);
app.use(clienteRoutes);
app.use(cobradorRoutes);
app.use(planesRoutes);
app.use(clientesRoutes);
app.use(adminCobranzasRoutes);
app.use(retirosRoutes);
app.use(cobrosRoutes);

// Página de inicio
app.get('/', (req, res) => {
  res.render('inicio', { titulo: 'Inicio' });
});

// =====================================================
// 6) Arranque (DB → Cron → Listen)
// =====================================================
const PORT = process.env.PORT || 3000;

const iniciarApp = async () => {
  try {
    await conectarDB();

    // ✅ Arrancar el cron SOLO después de DB
    iniciarCronCargosMensuales();

    app.listen(PORT, () => {
      console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error iniciando la app:", error);
    process.exit(1);
  }
};

iniciarApp();
