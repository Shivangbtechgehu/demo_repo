const { failure, success } = require('../../utils/response');
const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const data = await authService.registerUser(req.body);
    return res.status(201).json({ data, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

async function verifyRegisterOtp(req, res, next) {
  try {
    const data = await authService.verifyRegisterOtp(req.body);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.loginUser(req.body);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

async function verifyLoginOtp(req, res, next) {
  try {
    const data = await authService.verifyLoginOtp(req.body);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    if (!req.user?.id) {
      return failure(res, 401, 'UNAUTHORIZED', 'Authentication token is required.');
    }
    const user = await authService.getCurrentUser(req.user.id);
    return success(res, { user });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  verifyRegisterOtp,
  login,
  verifyLoginOtp,
  me,
};
