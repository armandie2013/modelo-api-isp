import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // máximo 5 intentos por IP
  message: 'Demasiados intentos fallidos. Intente nuevamente en 5 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

export default loginLimiter;