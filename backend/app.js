const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const { env } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { success } = require('./utils/response');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.appOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  return success(res, {
    status: 'ok',
    service: 'AI Career Success Platform API',
    uptime: process.uptime(),
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;