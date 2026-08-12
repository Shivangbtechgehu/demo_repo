const { z } = require('zod');
const { failure } = require('../../utils/response');

const careerGoalCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters long.').max(120, 'Title must be at most 120 characters long.'),
  targetRole: z.string().trim().min(2, 'Target role must be at least 2 characters long.').max(120, 'Target role must be at most 120 characters long.'),
  description: z.string().trim().max(1000, 'Description must be at most 1000 characters long.').optional().or(z.literal('')),
  targetDate: z.string().trim().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  notes: z.string().trim().max(2000, 'Notes must be at most 2000 characters long.').optional().or(z.literal('')),
});

const careerGoalUpdateSchema = careerGoalCreateSchema.partial();

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
  careerGoalCreateSchema,
  careerGoalUpdateSchema,
  validateBody,
};
