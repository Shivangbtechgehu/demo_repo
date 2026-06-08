const dotenv = require('dotenv');

dotenv.config();

function getRequiredEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
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
};

module.exports = { env, getRequiredEnv };