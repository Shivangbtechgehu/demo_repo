const { z } = require('zod');
const { failure } = require('../../utils/response');

const profileBodySchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long.').max(100, 'Full name must be at most 100 characters long.'),
  education: z.string().trim().min(2, 'Education must be at least 2 characters long.').max(200, 'Education must be at most 200 characters long.'),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters long.').max(1000, 'Bio must be at most 1000 characters long.'),
  currentSkills: z.array(z.string().trim().min(1).max(80)).default([]),
  interests: z.array(z.string().trim().min(1).max(80)).default([]),
  targetRole: z.string().trim().max(120).optional().or(z.literal('')),
});

const profilePatchSchema = profileBodySchema.partial();

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

module.exports = {
  profileBodySchema,
  profilePatchSchema,
  validateBody,
};
