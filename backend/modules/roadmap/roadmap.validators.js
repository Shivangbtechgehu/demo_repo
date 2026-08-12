const { z } = require('zod');
const { failure } = require('../../utils/response');

const roadmapGenerateSchema = z.object({
  goalId: z.string().trim().min(1, 'goalId is required.'),
});

const roadmapParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required.'),
});

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return failure(res, 400, 'VALIDATION_ERROR', 'Request validation failed.', formatZodIssues(result.error.issues));
    }

    req.body = result.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return failure(res, 400, 'VALIDATION_ERROR', 'Request validation failed.', formatZodIssues(result.error.issues));
    }

    req.params = result.data;
    return next();
  };
}

module.exports = {
  roadmapGenerateSchema,
  roadmapParamsSchema,
  validateBody,
  validateParams,
};
