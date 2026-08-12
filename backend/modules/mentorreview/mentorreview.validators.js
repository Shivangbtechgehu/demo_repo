const { z } = require('zod');
const { failure } = require('../../utils/response');

const createReviewSchema = z.object({
  roadmapId: z.string().trim().min(1, 'roadmapId is required.'),
  studentId: z.string().trim().min(1, 'studentId is required.'),
  comment:   z.string().trim().min(5, 'Comment must be at least 5 characters.').max(2000),
});

const updateReviewSchema = z.object({
  comment: z.string().trim().min(5).max(2000).optional(),
  status:  z.enum(['pending', 'approved', 'rejected']).optional(),
}).refine((data) => data.comment !== undefined || data.status !== undefined, {
  message: 'Provide at least comment or status.',
});

const reviewParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required.'),
});

const roadmapParamsSchema = z.object({
  roadmapId: z.string().trim().min(1, 'roadmapId is required.'),
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
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  roadmapParamsSchema,
  validateBody,
  validateParams,
};
