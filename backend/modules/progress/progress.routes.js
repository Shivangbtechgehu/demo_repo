const express = require('express');
const progressController = require('./progress.controller');
const { requireAuth } = require('../auth/auth.middleware');
const {
  initProgressSchema,
  roadmapIdParamsSchema,
  milestoneParamsSchema,
  updateMilestoneBodySchema,
  validateBody,
  validateParams,
} = require('./progress.validators');

const router = express.Router();

// POST /api/v1/progress — Initialize progress tracker for a roadmap
router.post(
  '/',
  requireAuth,
  validateBody(initProgressSchema),
  progressController.initializeProgress
);

// GET /api/v1/progress — List all progress records for the user
router.get('/', requireAuth, progressController.listAllProgress);

// GET /api/v1/progress/:roadmapId — Get progress for a specific roadmap
router.get(
  '/:roadmapId',
  requireAuth,
  validateParams(roadmapIdParamsSchema),
  progressController.getProgressByRoadmap
);

// PATCH /api/v1/progress/:roadmapId/steps/:stepOrder — Mark a step complete or incomplete
router.patch(
  '/:roadmapId/steps/:stepOrder',
  requireAuth,
  validateParams(milestoneParamsSchema),
  validateBody(updateMilestoneBodySchema),
  progressController.updateMilestone
);

// DELETE /api/v1/progress/:roadmapId/reset — Reset all milestones to incomplete
router.delete(
  '/:roadmapId/reset',
  requireAuth,
  validateParams(roadmapIdParamsSchema),
  progressController.resetProgress
);

module.exports = router;
