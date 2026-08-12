const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const authRoutes = require('./modules/auth/auth.routes');
const profileRoutes = require('./modules/profile/profile.routes');
const careerGoalRoutes = require('./modules/careergoal/careergoal.routes');
const skillRoutes = require('./modules/skill/skill.routes');
const gapAnalysisRoutes = require('./modules/gapanalysis/gapanalysis.routes');
const roadmapRoutes = require('./modules/roadmap/roadmap.routes');
const progressRoutes = require('./modules/progress/progress.routes');
const auditLogRoutes = require('./modules/auditlog/auditlog.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const mentorReviewRoutes = require('./modules/mentorreview/mentorreview.routes');
const { projectRouter, taskRouter } = require('./modules/project/project.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

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
  const { isSmtpConfigured } = require('./config/smtp');
  return res.json({
    data: {
      status: 'ok',
      service: 'AI Career Success Platform API',
      environment: env.nodeEnv,
      uptime: process.uptime(),
      emailService: isSmtpConfigured ? 'configured' : 'not_configured',
    },
    meta: {},
    error: null,
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/careergoal', careerGoalRoutes);
app.use('/api/v1/skill', skillRoutes);
app.use('/api/v1/gap-analysis', gapAnalysisRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/mentor-reviews', mentorReviewRoutes);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;