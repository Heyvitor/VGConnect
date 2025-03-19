const rateLimit = require('express-rate-limit');

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100000, // 100000 requisições por IP
  message: { status: false, error: 'Muitas requisições, tente novamente mais tarde' },
});

module.exports = rateLimitMiddleware;