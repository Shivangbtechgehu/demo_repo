const { z } = require('zod');
const { failure } = require('../../utils/response');

const gapAnalysisParamsSchema = z.object({
  goalId: z.string().trim().min(1, 'goalId is required.'),
});

const gapAnalysisBodySchema = z.object({
  goalId: z.string().trim().min(1, 'goalId is required.'),
});

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
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

module.exports = {
  gapAnalysisParamsSchema,
  gapAnalysisBodySchema,
  validateParams,
  validateBody,
};
