const { z } = require('zod');
const { failure } = require('../../utils/response');

const updateRoleSchema = z.object({
  role: z.enum(['student', 'mentor', 'admin'], { required_error: 'role is required.' }),
});

const idParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required.'),
});

const listUsersQuerySchema = z.object({
  role:  z.enum(['student', 'mentor', 'admin']).optional(),
  email: z.string().trim().optional(),
  page:  z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

function formatZodIssues(issues) {
  return issues.map((i) => ({ field: i.path.join('.') || 'body', message: i.message }));
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
  updateRoleSchema,
  idParamsSchema,
  listUsersQuerySchema,
  validateBody,
  validateParams,
  validateQuery,
};
