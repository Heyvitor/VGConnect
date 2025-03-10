const express = require('express');
const winston = require('winston');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const hooksalsaRoutes = require('./routes/hooksalsa');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

app.use(express.json());
app.use(express.text({ type: 'application/xml' }));
app.use(rateLimitMiddleware);
app.use((req, res, next) => {
  logger.info(`Requisição - Método: ${req.method}, URL: ${req.url}, IP: ${req.ip}`);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/games', gameRoutes);
app.use('/api/hk1', hooksalsaRoutes);

app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`);
  res.status(500).json({ status: false, error: 'Erro interno do servidor' });
});

module.exports = app;