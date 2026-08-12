const { z } = require('zod');
const { failure } = require('../../utils/response');

const initProgressSchema = z.object({
  roadmapId: z.string().trim().min(1, 'roadmapId is required.'),
});

const roadmapIdParamsSchema = z.object({
  roadmapId: z.string().trim().min(1, 'roadmapId is required.'),
});

const milestoneParamsSchema = z.object({
  roadmapId: z.string().trim().min(1, 'roadmapId is required.'),
  stepOrder: z
    .string()
    .trim()
    .min(1, 'stepOrder is required.')
    .refine(
      (val) => Number.isInteger(Number(val)) && Number(val) >= 1,
      { message: 'stepOrder must be a positive integer.' }
    ),
});

const updateMilestoneBodySchema = z.object({
  completed: z.boolean({ required_error: 'completed (boolean) is required.' }),
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
      return failure(
        res,
        400,
        'VALIDATION_ERROR',
        'Request validation failed.',
        formatZodIssues(result.error.issues)
      );
    }

    req.body = result.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return failure(
        res,
        400,
        'VALIDATION_ERROR',
        'Request validation failed.',
        formatZodIssues(result.error.issues)
      );
    }

    req.params = result.data;
    return next();
  };
}

module.exports = {
  initProgressSchema,
  roadmapIdParamsSchema,
  milestoneParamsSchema,
  updateMilestoneBodySchema,
  validateBody,
  validateParams,
};
