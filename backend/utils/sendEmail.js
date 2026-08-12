const { transporter, isSmtpConfigured } = require('../config/smtp');
const { env } = require('../config/env');

/**
 * Send a plain OTP email.
 * Throws a controlled error if SMTP is not configured — never crashes the server.
 *
 * @param {string} to      - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} otp     - Plain 6-digit OTP to include in the body
 */
async function sendOtpEmail(to, subject, otp) {
  // Guard — SMTP not configured
  if (!isSmtpConfigured || !transporter) {
    const err = new Error(
      'Email service is not configured. Please contact the administrator.'
    );
    err.statusCode = 503;
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
      <h2 style="color: #4f46e5;">${subject}</h2>
      <p>Use the OTP below to verify your identity.</p>
      <p>It expires in <strong>${env.otpExpiresInMinutes} minutes</strong>.</p>
      <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #111; padding: 20px 0;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 13px;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Wrap nodemailer errors with a clean message — do not expose raw SMTP errors
    console.error('[SMTP] Failed to send email to:', to, '| Error:', err.message);
    const wrappedErr = new Error(
      'Failed to send email. Please try again later or contact support.'
    );
    wrappedErr.statusCode = 503;
    wrappedErr.code = 'SMTP_SEND_FAILED';
    throw wrappedErr;
  }
}

module.exports = { sendOtpEmail };
