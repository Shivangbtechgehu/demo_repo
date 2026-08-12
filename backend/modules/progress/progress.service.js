const roadmapRepository = require('../roadmap/roadmap.repository');
const progressRepository = require('./progress.repository');
const auditLog = require('../auditlog/auditlog.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function computeStats(milestones) {
  const totalSteps = milestones.length;
  const completedSteps = milestones.filter((m) => m.completed).length;
  const progressPercentage =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  let status = 'not_started';
  if (completedSteps > 0 && completedSteps < totalSteps) {
    status = 'in_progress';
  } else if (totalSteps > 0 && completedSteps === totalSteps) {
    status = 'completed';
  }

  return { totalSteps, completedSteps, progressPercentage, status };
}

function serializeProgress(progress) {
  if (!progress) {
    return null;
  }

  return {
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    roadmapId: progress.roadmapId.toString(),
    goalId: progress.goalId.toString(),
    milestones: progress.milestones.map((m) => ({
      stepOrder: m.stepOrder,
      stepTitle: m.stepTitle,
      completed: m.completed,
      completedAt: m.completedAt,
    })),
    totalSteps: progress.totalSteps,
    completedSteps: progress.completedSteps,
    progressPercentage: progress.progressPercentage,
    status: progress.status,
    createdAt: progress.createdAt,
    updatedAt: progress.updatedAt,
  };
}

/**
 * Initialize a progress tracker for a roadmap.
 * Idempotent — returns existing progress if already initialized.
 */
async function initializeProgress(userId, roadmapId) {
  const roadmap = await roadmapRepository.findRoadmapByIdAndUserId(roadmapId, userId);

  if (!roadmap) {
    throw createAppError('Roadmap not found.', 404, 'ROADMAP_NOT_FOUND');
  }

  const existing = await progressRepository.findProgressByUserIdAndRoadmapId(userId, roadmapId);

  if (existing) {
    return serializeProgress(existing);
  }

  const milestones = roadmap.steps.map((step) => ({
    stepOrder: step.order,
    stepTitle: step.title,
    completed: false,
    completedAt: null,
  }));

  const stats = computeStats(milestones);

  const progress = await progressRepository.createProgress({
    userId,
    roadmapId,
    goalId: roadmap.goalId,
    milestones,
    ...stats,
  });

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.PROGRESS_INITIALIZED,
    resourceType: 'Progress',
    resourceId: progress._id.toString(),
    metadata: { roadmapId },
  });

  return serializeProgress(progress);
}

/**
 * Mark a specific roadmap step as complete or incomplete.
 */
async function updateMilestone(userId, roadmapId, stepOrder, completed) {
  const progress = await progressRepository.findProgressByUserIdAndRoadmapId(userId, roadmapId);

  if (!progress) {
    throw createAppError(
      'Progress tracker not found. Initialize progress for this roadmap first.',
      404,
      'PROGRESS_NOT_FOUND'
    );
  }

  const milestoneIndex = progress.milestones.findIndex((m) => m.stepOrder === stepOrder);

  if (milestoneIndex === -1) {
    throw createAppError(
      `Step with order ${stepOrder} does not exist in this roadmap.`,
      404,
      'STEP_NOT_FOUND'
    );
  }

  const updatedMilestones = progress.milestones.map((m, index) => {
    if (index !== milestoneIndex) {
      return m;
    }
    return {
      stepOrder: m.stepOrder,
      stepTitle: m.stepTitle,
      completed,
      completedAt: completed ? new Date() : null,
    };
  });

  const stats = computeStats(updatedMilestones);

  const updated = await progressRepository.updateProgressById(progress._id, {
    milestones: updatedMilestones,
    ...stats,
  });

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.PROGRESS_MILESTONE_UPDATED,
    resourceType: 'Progress',
    resourceId: progress._id.toString(),
    metadata: { stepOrder, completed },
  });

  return serializeProgress(updated);
}

/**
 * Get progress for a specific roadmap.
 */
async function getProgressByRoadmap(userId, roadmapId) {
  const progress = await progressRepository.findProgressByUserIdAndRoadmapId(userId, roadmapId);

  if (!progress) {
    throw createAppError(
      'Progress tracker not found. Initialize progress for this roadmap first.',
      404,
      'PROGRESS_NOT_FOUND'
    );
  }

  return serializeProgress(progress);
}

/**
 * List all progress records for the authenticated user.
 */
async function listAllProgress(userId) {
  const records = await progressRepository.listProgressByUserId(userId);
  return records.map(serializeProgress);
}

/**
 * Reset all milestones to incomplete for a roadmap.
 */
async function resetProgress(userId, roadmapId) {
  const progress = await progressRepository.findProgressByUserIdAndRoadmapId(userId, roadmapId);

  if (!progress) {
    throw createAppError(
      'Progress tracker not found. Initialize progress for this roadmap first.',
      404,
      'PROGRESS_NOT_FOUND'
    );
  }

  const resetMilestones = progress.milestones.map((m) => ({
    stepOrder: m.stepOrder,
    stepTitle: m.stepTitle,
    completed: false,
    completedAt: null,
  }));

  const stats = computeStats(resetMilestones);

  const updated = await progressRepository.updateProgressById(progress._id, {
    milestones: resetMilestones,
    ...stats,
  });

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.PROGRESS_RESET,
    resourceType: 'Progress',
    resourceId: progress._id.toString(),
    metadata: { roadmapId },
  });

  return serializeProgress(updated);
}

module.exports = {
  initializeProgress,
  updateMilestone,
  getProgressByRoadmap,
  listAllProgress,
  resetProgress,
  serializeProgress,
};
