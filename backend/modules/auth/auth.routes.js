const express = require('express');
const authController = require('./auth.controller');
const { requireAuth, authorizeRoles, ROLES } = require('./auth.middleware');
const { validateBody, registerSchema, loginSchema, verifyOtpSchema } = require('./auth.validators');
const { success } = require('../../utils/response');

const router = express.Router();

// Register — sends OTP, does NOT return token
router.post('/register', validateBody(registerSchema), authController.register);

// Verify registration OTP — returns token + user
router.post('/verify-register-otp', validateBody(verifyOtpSchema), authController.verifyRegisterOtp);

// Login — sends OTP, does NOT return token
router.post('/login', validateBody(loginSchema), authController.login);

// Verify login OTP — returns token + user
router.post('/verify-login-otp', validateBody(verifyOtpSchema), authController.verifyLoginOtp);

// Protected profile route
router.get('/me', requireAuth, authController.me);

router.get('/admin-only', requireAuth, authorizeRoles(ROLES.ADMIN), (req, res) => {
  return success(res, { message: 'Admin access granted.' });
});

module.exports = router;
