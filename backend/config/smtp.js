const nodemailer = require('nodemailer');
const { env } = require('./env');

// Check if all required SMTP variables are present
const isSmtpConfigured =
  env.smtpHost &&
  env.smtpPort &&
  env.smtpUser &&
  env.smtpPass &&
  env.smtpFrom;

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465, // true for port 465, false for 587
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
  console.log('SMTP transporter created successfully');
} else {
  // Log a warning but NEVER crash the server
  console.warn(
    '[SMTP] Warning: SMTP environment variables are missing or incomplete. ' +
    'Email features (OTP) will be unavailable. ' +
    'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM to enable email.'
  );
}

// Export the transporter (may be null if not configured)
module.exports = { transporter, isSmtpConfigured: Boolean(isSmtpConfigured) };
