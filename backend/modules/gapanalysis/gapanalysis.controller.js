const { success } = require('../../utils/response');
const gapAnalysisService = require('./gapanalysis.service');

// POST /api/v1/gap-analysis  { goalId }  — generate (or re-generate) analysis
async function generateAnalysis(req, res, next) {
  try {
    const analysis = await gapAnalysisService.generateGapAnalysis(req.user.id, req.body.goalId);
    return res.status(201).json({ data: { analysis }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/gap-analysis/:goalId  — fetch the last saved analysis
async function getAnalysis(req, res, next) {
  try {
    const analysis = await gapAnalysisService.getLastAnalysis(req.user.id, req.params.goalId);
    return success(res, { analysis });
  } catch (error) {
    return next(error);
  }
}

// Keep the old export name so nothing breaks
async function analyzeGap(req, res, next) {
  return getAnalysis(req, res, next);
}

module.exports = {
  generateAnalysis,
  getAnalysis,
  analyzeGap,
};
