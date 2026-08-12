const { z } = require('zod');
const { failure } = require('../../utils/response');

const notificationParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required.'),
});

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'params',
    message: issue.message,
  }));
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return failure(
        res, 400, 'VALIDATION_ERROR',
        'Request validation failed.',
        formatZodIssues(result.error.issues)
      );
    }
    req.params = result.data;
    return next();
  };
}

module.exports = {
  notificationParamsSchema,
  validateParams,
};
