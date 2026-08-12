const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { AUTH_TOKEN_TTL, ROLES } = require('./auth.constants');
const authRepository = require('./auth.repository');
const { generateOtp, hashOtp, compareOtp } = require('../../utils/generateOtp');
const { sendOtpEmail } = require('../../utils/sendEmail');
const auditLog = require('../auditlog/auditlog.service');

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified || false,
    createdAt: user.createdAt,
    profileImage: user.profileImage || '',
  };
}

function generateToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: AUTH_TOKEN_TTL });
}

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

// ─── Register ────────────────────────────────────────────────────────────────

async function registerUser(payload) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').toLowerCase().trim();
  const password = String(payload.password || '');

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw createError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
  }

  // Generate OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);

  // Create user — not verified yet
  await authRepository.createUser({
    name,
    email,
    password,
    role: ROLES.STUDENT,
    isEmailVerified: false,
    otp: hashedOtp,
    otpExpiresAt,
  });

  // Send OTP email
  await sendOtpEmail(email, 'Verify your email — OTP', otp);

  // Audit — use email as resourceId since we don't expose the user id yet
  auditLog.log({
    actorId: '000000000000000000000000', // system actor before user id is known
    actorRole: ROLES.STUDENT,
    action: auditLog.ACTIONS.USER_REGISTERED,
    resourceType: 'User',
    resourceId: email,
    metadata: { name, email },
  });

  return { message: `OTP sent to ${email}. Please verify your email to continue.` };
}

// ─── Verify Register OTP ─────────────────────────────────────────────────────

async function verifyRegisterOtp(payload) {
  const email = String(payload.email || '').toLowerCase().trim();
  const otp = String(payload.otp || '').trim();

  const user = await authRepository.findUserByEmailWithOtp(email);
  if (!user) {
    throw createError('No account found with this email.', 404, 'USER_NOT_FOUND');
  }

  if (user.isEmailVerified) {
    throw createError('Email is already verified. Please log in.', 400, 'ALREADY_VERIFIED');
  }

  if (!user.otp || !user.otpExpiresAt) {
    throw createError('No OTP found. Please register again.', 400, 'OTP_NOT_FOUND');
  }

  if (new Date() > new Date(user.otpExpiresAt)) {
    throw createError('OTP has expired. Please register again.', 400, 'OTP_EXPIRED');
  }

  const isMatch = await compareOtp(otp, user.otp);
  if (!isMatch) {
    throw createError('Invalid OTP. Please try again.', 400, 'INVALID_OTP');
  }

  // Mark verified and clear OTP
  await authRepository.updateUserById(user._id, {
    isEmailVerified: true,
    otp: null,
    otpExpiresAt: null,
  });

  const updatedUser = await authRepository.findUserById(user._id);

  // Audit — email verified
  auditLog.log({
    actorId: user._id.toString(),
    actorRole: updatedUser.role,
    action: auditLog.ACTIONS.USER_VERIFIED,
    resourceType: 'User',
    resourceId: user._id.toString(),
  });

  return {
    user: sanitizeUser(updatedUser),
    token: generateToken(user._id.toString()),
  };
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function loginUser(payload) {
  const email = String(payload.email || '').toLowerCase().trim();
  const password = String(payload.password || '');

  const user = await authRepository.findUserByEmailWithOtp(email);
  if (!user) {
    throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isEmailVerified) {
    throw createError('Please verify your email before logging in.', 403, 'EMAIL_NOT_VERIFIED');
  }

  // Generate and send login OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);

  await authRepository.updateUserById(user._id, { otp: hashedOtp, otpExpiresAt });

  await sendOtpEmail(email, 'Your login OTP', otp);

  return { message: `Login OTP sent to ${email}. Please verify to continue.` };
}

// ─── Verify Login OTP ────────────────────────────────────────────────────────

async function verifyLoginOtp(payload) {
  const email = String(payload.email || '').toLowerCase().trim();
  const otp = String(payload.otp || '').trim();

  const user = await authRepository.findUserByEmailWithOtp(email);
  if (!user) {
    throw createError('No account found with this email.', 404, 'USER_NOT_FOUND');
  }

  if (!user.otp || !user.otpExpiresAt) {
    throw createError('No OTP found. Please log in again.', 400, 'OTP_NOT_FOUND');
  }

  if (new Date() > new Date(user.otpExpiresAt)) {
    throw createError('OTP has expired. Please log in again.', 400, 'OTP_EXPIRED');
  }

  const isMatch = await compareOtp(otp, user.otp);
  if (!isMatch) {
    throw createError('Invalid OTP. Please try again.', 400, 'INVALID_OTP');
  }

  // Clear OTP after successful verification
  await authRepository.updateUserById(user._id, { otp: null, otpExpiresAt: null });

  const updatedUser = await authRepository.findUserById(user._id);

  // Audit — login verified
  auditLog.log({
    actorId: user._id.toString(),
    actorRole: updatedUser.role,
    action: auditLog.ACTIONS.USER_LOGGED_IN,
    resourceType: 'User',
    resourceId: user._id.toString(),
  });

  return {
    user: sanitizeUser(updatedUser),
    token: generateToken(user._id.toString()),
  };
}

// ─── Get current user ────────────────────────────────────────────────────────

async function getCurrentUser(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw createError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  verifyRegisterOtp,
  loginUser,
  verifyLoginOtp,
  getCurrentUser,
  sanitizeUser,
  generateToken,
};
