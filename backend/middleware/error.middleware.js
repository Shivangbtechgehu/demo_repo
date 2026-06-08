const { failure } = require('../utils/response');

function notFound(req, res) {
  return failure(res, 404, 'NOT_FOUND', 'The requested resource was not found.');
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong.';

  return failure(res, statusCode, code, message);
}

module.exports = { notFound, errorHandler };