const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { failure } = require('../../utils/response');
const authRepository = require('./auth.repository');
const { ROLES } = require('./auth.constants');

function extractBearerToken(authorizationHeader = '') {
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return failure(res, 401, 'UNAUTHORIZED', 'Authentication token is required.');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await authRepository.findUserById(payload.sub);

    if (!user) {
      return failure(res, 401, 'UNAUTHORIZED', 'Invalid or expired token.');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profileImage: user.profileImage || '',
    };

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return failure(res, 401, 'UNAUTHORIZED', 'Invalid or expired token.');
    }

    return next(error);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return failure(res, 401, 'UNAUTHORIZED', 'Authentication token is required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return failure(res, 403, 'FORBIDDEN', 'You do not have permission to access this resource.');
    }

    return next();
  };
}

module.exports = {
  ROLES,
  requireAuth,
  authorizeRoles,
  extractBearerToken,
};
