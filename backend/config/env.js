const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function getRequiredEnv(name, fallback = undefined) {
  const value = (process.env[name] ?? fallback)?.trim();
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: getRequiredEnv('MONGO_URI', 'mongodb://127.0.0.1:27017/acrg'),
  jwtSecret: getRequiredEnv('JWT_SECRET', 'dev-jwt-secret-change-me'),
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:5173',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'mock',
  // SMTP
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'App <no-reply@app.com>',
  otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES || 10),
};

module.exports = { env, getRequiredEnv };