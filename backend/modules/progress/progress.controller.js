const { success } = require('../../utils/response');
const progressService = require('./progress.service');

async function initializeProgress(req, res, next) {
  try {
    const progress = await progressService.initializeProgress(req.user.id, req.body.roadmapId);
    return res.status(201).json({
      data: { progress },
      meta: {},
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMilestone(req, res, next) {
  try {
    const { roadmapId, stepOrder } = req.params;
    const { completed } = req.body;

    const progress = await progressService.updateMilestone(
      req.user.id,
      roadmapId,
      Number(stepOrder),
      Boolean(completed)
    );

    return success(res, { progress });
  } catch (error) {
    return next(error);
  }
}

async function getProgressByRoadmap(req, res, next) {
  try {
    const progress = await progressService.getProgressByRoadmap(req.user.id, req.params.roadmapId);
    return success(res, { progress });
  } catch (error) {
    return next(error);
  }
}

async function listAllProgress(req, res, next) {
  try {
    const records = await progressService.listAllProgress(req.user.id);
    return success(res, { progress: records });
  } catch (error) {
    return next(error);
  }
}

async function resetProgress(req, res, next) {
  try {
    const progress = await progressService.resetProgress(req.user.id, req.params.roadmapId);
    return success(res, { progress });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  initializeProgress,
  updateMilestone,
  getProgressByRoadmap,
  listAllProgress,
  resetProgress,
};
