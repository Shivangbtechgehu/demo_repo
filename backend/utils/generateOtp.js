const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a 6-digit numeric OTP string.
 */
function generateOtp() {
  // Generates a number between 100000 and 999999
  return String(Math.floor(100000 + crypto.randomInt(900000)));
}

/**
 * Hash an OTP using bcrypt before storing in DB.
 */
async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

/**
 * Compare a plain OTP with a stored hashed OTP.
 */
async function compareOtp(plainOtp, hashedOtp) {
  return bcrypt.compare(plainOtp, hashedOtp);
}

module.exports = { generateOtp, hashOtp, compareOtp };
