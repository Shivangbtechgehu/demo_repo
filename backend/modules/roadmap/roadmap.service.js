const careerGoalRepository = require('../careergoal/careergoal.repository');
const gapAnalysisService = require('../gapanalysis/gapanalysis.service');
const roadmapRepository = require('./roadmap.repository');
const auditLog = require('../auditlog/auditlog.service');
const { notify } = require('../notification/notification.service');
const aiService = require('../../services/ai/ai.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeRoadmapStep(step) {
  return {
    order:         step.order,
    title:         step.title,
    description:   step.description   || '',
    estimatedDays: step.estimatedDays || 0,
    resources:     step.resources     || [],
  };
}

function serializeRoadmap(roadmap) {
  if (!roadmap) return null;

  return {
    id:                   roadmap._id.toString(),
    userId:               roadmap.userId.toString(),
    goalId:               roadmap.goalId.toString(),
    roadmapTitle:         roadmap.roadmapTitle || roadmap.goalTitle,
    goalTitle:            roadmap.goalTitle,
    targetRole:           roadmap.targetRole,
    overview:             roadmap.overview,
    estimatedDuration:    roadmap.estimatedDuration || null,
    sourceMatchedSkills:  roadmap.sourceMatchedSkills || [],
    sourceMissingSkills:  roadmap.sourceMissingSkills || [],
    steps:                (roadmap.steps || []).map(normalizeRoadmapStep),
    totalEstimatedDays:   roadmap.totalEstimatedDays,
    status:               roadmap.status,
    createdAt:            roadmap.createdAt,
    updatedAt:            roadmap.updatedAt,
  };
}

// ── Generate roadmap using AI (with automatic fallback) ──────────────────────

async function generateRoadmap(userId, goalId) {
  const goal = await careerGoalRepository.findGoalByIdAndUserId(goalId, userId);
  if (!goal) {
    throw createAppError('Career goal not found.', 404, 'GOAL_NOT_FOUND');
  }

  const analysis = await gapAnalysisService.generateGapAnalysis(userId, goalId);

  // Call AI service — never throws, falls back automatically
  const aiResult = await aiService.generateRoadmap({
    goalTitle:     goal.title,
    targetRole:    goal.targetRole,
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
  });

  if (aiResult.usedFallback) {
    console.warn(
      '[Roadmap] AI fallback used — userId=%s goalId=%s reason=%s',
      userId, goalId, aiResult.fallbackReason || 'mock mode'
    );
  }

  // Persist to MongoDB
  const roadmap = await roadmapRepository.upsertRoadmap(
    { userId, goalId },
    {
      userId,
      goalId,
      goalTitle:           goal.title,
      roadmapTitle:        aiResult.roadmapTitle,
      estimatedDuration:   aiResult.estimatedDuration,
      targetRole:          goal.targetRole,
      overview:            aiResult.overview,
      sourceMatchedSkills: analysis.matchedSkills,
      sourceMissingSkills: analysis.missingSkills,
      steps:               aiResult.steps,
      totalEstimatedDays:  aiResult.totalEstimatedDays,
      status:              'active',
    }
  );

  // Audit
  auditLog.log({
    actorId:      userId,
    actorRole:    'student',
    action:       auditLog.ACTIONS.ROADMAP_GENERATED,
    resourceType: 'Roadmap',
    resourceId:   roadmap._id.toString(),
    metadata: {
      goalId,
      totalEstimatedDays: aiResult.totalEstimatedDays,
      steps:              aiResult.steps.length,
      aiProvider:         aiResult.aiProvider,
      usedFallback:       aiResult.usedFallback,
    },
  });

  // Notify user
  notify({
    userId,
    title:   '🗺️ Roadmap generated!',
    message: `Your personalised roadmap for "${goal.title}" is ready. You have ${aiResult.steps.length} steps to complete.`,
    type:    'roadmap',
  });

  return serializeRoadmap(roadmap);
}

// ── List + get ────────────────────────────────────────────────────────────────

async function listRoadmaps(userId, opts = {}) {
  const { roadmaps, total } = await roadmapRepository.listRoadmapsByUserId(userId, opts);
  return { roadmaps: roadmaps.map(serializeRoadmap), total };
}

async function getRoadmapById(userId, roadmapId) {
  const roadmap = await roadmapRepository.findRoadmapByIdAndUserId(roadmapId, userId);
  if (!roadmap) {
    throw createAppError('Roadmap not found.', 404, 'ROADMAP_NOT_FOUND');
  }
  return serializeRoadmap(roadmap);
}

module.exports = {
  generateRoadmap,
  listRoadmaps,
  getRoadmapById,
  serializeRoadmap,
};
