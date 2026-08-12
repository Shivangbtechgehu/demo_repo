const { z } = require('zod');
const { failure } = require('../../utils/response');

const auditLogParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required.'),
});

const auditLogQuerySchema = z.object({
  actorId:      z.string().trim().optional(),
  action:       z.string().trim().optional(),
  resourceType: z.string().trim().optional(),
  fromDate:     z.string().trim().optional(),
  toDate:       z.string().trim().optional(),
  page:  z.string().regex(/^\d+$/, 'page must be a number.').optional(),
  limit: z.string().regex(/^\d+$/, 'limit must be a number.').optional(),
});

function formatZodIssues(issues) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'query',
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

function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return failure(res, 400, 'VALIDATION_ERROR', 'Request validation failed.', formatZodIssues(result.error.issues));
    }
    req.query = result.data;
    return next();
  };
}

module.exports = {
  auditLogParamsSchema,
  auditLogQuerySchema,
  validateParams,
  validateQuery,
};
