const { z } = require('zod');
const { failure } = require('../../utils/response');

const createProjectSchema = z.object({
  title:           z.string().trim().min(2, 'Title must be at least 2 characters.').max(150),
  description:     z.string().trim().max(2000).optional(),
  roadmapId:       z.string().trim().optional(),
  goalId:          z.string().trim().optional(),
  linkedStepOrder: z.number().int().min(1).optional(),
});

const updateProjectSchema = z.object({
  title:           z.string().trim().min(2).max(150).optional(),
  description:     z.string().trim().max(2000).optional(),
  status:          z.enum(['planned', 'in_progress', 'completed', 'on_hold']).optional(),
  linkedStepOrder: z.number().int().min(1).nullable().optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update.' });

const addTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters.').max(200),
});

const updateTaskSchema = z.object({
  title:     z.string().trim().min(2).max(200).optional(),
  completed: z.boolean().optional(),
}).refine((d) => d.title !== undefined || d.completed !== undefined, {
  message: 'Provide title or completed.',
});

const idParamsSchema = z.object({
  id: z.string().trim().min(1, 'id is required.'),
});

const taskParamsSchema = z.object({
  projectId: z.string().trim().min(1, 'projectId is required.'),
  taskId:    z.string().trim().min(1, 'taskId is required.'),
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

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addTaskSchema,
  updateTaskSchema,
  idParamsSchema,
  taskParamsSchema,
  validateBody,
  validateParams,
};
