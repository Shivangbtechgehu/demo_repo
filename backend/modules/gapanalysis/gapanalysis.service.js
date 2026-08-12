const careerGoalRepository = require('../careergoal/careergoal.repository');
const profileRepository = require('../profile/profile.repository');
const skillRepository = require('../skill/skill.repository');
const gapAnalysisRepository = require('./gapanalysis.repository');
const auditLog = require('../auditlog/auditlog.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeList(values = []) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0)
    )
  );
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function serializeAnalysis(analysis) {
  if (!analysis) {
    return null;
  }

  return {
    id: analysis._id.toString(),
    userId: analysis.userId.toString(),
    goalId: analysis.goalId.toString(),
    goalTitle: analysis.goalTitle,
    targetRole: analysis.targetRole,
    requiredSkills: analysis.requiredSkills || [],
    matchedSkills: analysis.matchedSkills || [],
    missingSkills: analysis.missingSkills || [],
    completionPercentage: analysis.completionPercentage,
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,
  };
}

async function generateGapAnalysis(userId, goalId) {
  const goal = await careerGoalRepository.findGoalByIdAndUserId(goalId, userId);

  if (!goal) {
    throw createAppError('Career goal not found.', 404, 'GOAL_NOT_FOUND');
  }

  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    throw createAppError('Profile not found. Please create your profile first.', 404, 'PROFILE_NOT_FOUND');
  }

  const { skills } = await skillRepository.findSkillsByUserId(userId);
  const requiredSkillDocs = skills.filter((skill) => {
    const mappedGoalIds = (skill.mappedGoalIds || []).map((mappedGoalId) => mappedGoalId.toString());
    return mappedGoalIds.includes(goalId.toString());
  });

  const currentSkillKeys = normalizeList(profile.currentSkills).map(normalizeKey);
  const requiredSkills = normalizeList(requiredSkillDocs.map((skill) => skill.name));
  const matchedSkills = requiredSkills.filter((skillName) => currentSkillKeys.includes(normalizeKey(skillName)));
  const missingSkills = requiredSkills.filter((skillName) => !currentSkillKeys.includes(normalizeKey(skillName)));
  const completionPercentage = requiredSkills.length === 0
    ? 100
    : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  const analysis = await gapAnalysisRepository.upsertAnalysis(
    { userId, goalId },
    {
      userId,
      goalId,
      goalTitle: goal.title,
      targetRole: goal.targetRole,
      requiredSkills,
      matchedSkills,
      missingSkills,
      completionPercentage,
    }
  );

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.GAP_ANALYSIS_GENERATED,
    resourceType: 'GapAnalysis',
    resourceId: analysis._id.toString(),
    metadata: { goalId, completionPercentage },
  });

  return serializeAnalysis(analysis);
}

async function getLastAnalysis(userId, goalId) {
  const analysis = await gapAnalysisRepository.findAnalysisByUserIdAndGoalId(userId, goalId);
  return serializeAnalysis(analysis);
}

module.exports = {
  generateGapAnalysis,
  getLastAnalysis,
  serializeAnalysis,
};
