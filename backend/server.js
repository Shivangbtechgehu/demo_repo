const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  // ── MongoDB (required) ───────────────────────────────────────────────────
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.warn('Starting server without a database connection. Check MONGO_URI.');
  }

  // ── Cloudinary (optional — warn only) ────────────────────────────────────
  try {
    require('./config/cloudinary');
  } catch (error) {
    console.warn('[Cloudinary] Warning: Could not initialise Cloudinary:', error.message);
  }

  // ── SMTP is initialised lazily inside config/smtp.js (no startup crash) ──
  // The smtp.js module already logs a warning if SMTP vars are missing.
  require('./config/smtp');

  // ── Start HTTP server ─────────────────────────────────────────────────────
  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌  Port ${env.port} is already in use.`);
      console.error(`    Run: npm run kill-port  then restart.\n`);
      process.exit(1);
    } else {
      throw error;
    }
  });
}

startServer();
