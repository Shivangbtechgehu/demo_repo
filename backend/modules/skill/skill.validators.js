const { z } = require('zod');
const { failure } = require('../../utils/response');

const skillCreateSchema = z.object({
  name: z.string().trim().min(2, 'Skill name must be at least 2 characters long.').max(80, 'Skill name must be at most 80 characters long.'),
  category: z.string().trim().max(80, 'Category must be at most 80 characters long.').optional().or(z.literal('')),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  notes: z.string().trim().max(1000, 'Notes must be at most 1000 characters long.').optional().or(z.literal('')),
});

const skillUpdateSchema = skillCreateSchema.partial();

const skillGoalMapSchema = z.object({
  goalId: z.string().trim().min(1, 'goalId is required.'),
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

module.exports = {
  skillCreateSchema,
  skillUpdateSchema,
  skillGoalMapSchema,
  validateBody,
};
