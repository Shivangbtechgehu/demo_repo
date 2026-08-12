const express = require('express');
const gapAnalysisController = require('./gapanalysis.controller');
const { requireAuth } = require('../auth/auth.middleware');
const {
  gapAnalysisParamsSchema,
  gapAnalysisBodySchema,
  validateParams,
  validateBody,
} = require('./gapanalysis.validators');

const router = express.Router();

// POST /api/v1/gap-analysis  — generate (or re-run) gap analysis for a goal
router.post(
  '/',
  requireAuth,
  validateBody(gapAnalysisBodySchema),
  gapAnalysisController.generateAnalysis
);

// GET /api/v1/gap-analysis/:goalId  — fetch the last saved analysis
router.get(
  '/:goalId',
  requireAuth,
  validateParams(gapAnalysisParamsSchema),
  gapAnalysisController.getAnalysis
);

module.exports = router;
