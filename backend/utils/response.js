function success(res, data, meta = {}) {
  return res.json({
    data,
    meta,
    error: null,
  });
}

function failure(res, statusCode, code, message, details = []) {
  return res.status(statusCode).json({
    data: null,
    meta: {},
    error: {
      code,
      message,
      details,
    },
  });
}

module.exports = { success, failure };