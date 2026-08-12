const express = require('express');
const projectController = require('./project.controller');
const { requireAuth } = require('../auth/auth.middleware');
const {
  createProjectSchema,
  updateProjectSchema,
  addTaskSchema,
  updateTaskSchema,
  idParamsSchema,
  taskParamsSchema,
  validateBody,
  validateParams,
} = require('./project.validators');

const router = express.Router();

// ── Project routes ────────────────────────────────────────────────────────────
router.post(
  '/',
  requireAuth,
  validateBody(createProjectSchema),
  projectController.createProject
);

router.get('/', requireAuth, projectController.getProjects);

router.get(
  '/:id',
  requireAuth,
  validateParams(idParamsSchema),
  projectController.getProjectById
);

router.patch(
  '/:id',
  requireAuth,
  validateParams(idParamsSchema),
  validateBody(updateProjectSchema),
  projectController.updateProject
);

router.delete(
  '/:id',
  requireAuth,
  validateParams(idParamsSchema),
  projectController.deleteProject
);

// ── Task routes ───────────────────────────────────────────────────────────────

// POST /api/v1/projects/:id/tasks
router.post(
  '/:id/tasks',
  requireAuth,
  validateParams(idParamsSchema),
  validateBody(addTaskSchema),
  projectController.addTask
);

// PATCH /api/v1/tasks/:projectId/:taskId
const taskRouter = express.Router();

taskRouter.patch(
  '/:projectId/:taskId',
  requireAuth,
  validateParams(taskParamsSchema),
  validateBody(updateTaskSchema),
  projectController.updateTask
);

taskRouter.delete(
  '/:projectId/:taskId',
  requireAuth,
  validateParams(taskParamsSchema),
  projectController.deleteTask
);

module.exports = { projectRouter: router, taskRouter };
