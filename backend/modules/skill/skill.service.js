const skillRepository = require('./skill.repository');
const careerGoalRepository = require('../careergoal/careergoal.repository');
const auditLog = require('../auditlog/auditlog.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeSkill(skill) {
  if (!skill) {
    return null;
  }

  return {
    id: skill._id.toString(),
    userId: skill.userId.toString(),
    name: skill.name,
    category: skill.category || '',
    proficiencyLevel: skill.proficiencyLevel,
    notes: skill.notes || '',
    mappedGoalIds: (skill.mappedGoalIds || []).map((goalId) => goalId.toString()),
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

function normalizeUpdateData(payload) {
  const updateData = {};

  if (payload.name !== undefined) {
    updateData.name = String(payload.name).trim();
  }

  if (payload.category !== undefined) {
    updateData.category = String(payload.category).trim();
  }

  if (payload.proficiencyLevel !== undefined) {
    updateData.proficiencyLevel = payload.proficiencyLevel;
  }

  if (payload.notes !== undefined) {
    updateData.notes = String(payload.notes).trim();
  }

  return updateData;
}

async function addSkill(userId, payload) {
  const existingSkill = await skillRepository.findSkillByNameAndUserId(userId, String(payload.name).trim());

  if (existingSkill) {
    throw createAppError('Skill already exists for this user.', 409, 'SKILL_EXISTS');
  }

  const skill = await skillRepository.createSkill({
    userId,
    name: String(payload.name).trim(),
    category: String(payload.category || '').trim(),
    proficiencyLevel: payload.proficiencyLevel || 'beginner',
    notes: String(payload.notes || '').trim(),
  });

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.SKILL_CREATED,
    resourceType: 'Skill',
    resourceId: skill._id.toString(),
    metadata: { name: skill.name },
  });

  return normalizeSkill(skill);
}

async function getSkillsByUser(userId, opts = {}) {
  const { skills, total } = await skillRepository.findSkillsByUserId(userId, opts);
  return { skills: skills.map(normalizeSkill), total };
}

async function getSkillById(userId, skillId) {
  const skill = await skillRepository.findSkillByIdAndUserId(skillId, userId);

  if (!skill) {
    throw createAppError('Skill not found.', 404, 'SKILL_NOT_FOUND');
  }

  return normalizeSkill(skill);
}

async function updateSkill(userId, skillId, payload) {
  const existingSkill = await skillRepository.findSkillByIdAndUserId(skillId, userId);

  if (!existingSkill) {
    throw createAppError('Skill not found.', 404, 'SKILL_NOT_FOUND');
  }

  const updateData = normalizeUpdateData(payload);
  const skill = await skillRepository.updateSkillByIdAndUserId(skillId, userId, updateData);

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.SKILL_UPDATED,
    resourceType: 'Skill',
    resourceId: skillId,
  });

  return normalizeSkill(skill);
}

async function mapSkillToGoal(userId, skillId, goalId) {
  const skill = await skillRepository.findSkillByIdAndUserId(skillId, userId);

  if (!skill) {
    throw createAppError('Skill not found.', 404, 'SKILL_NOT_FOUND');
  }

  const goal = await careerGoalRepository.findGoalByIdAndUserId(goalId, userId);

  if (!goal) {
    throw createAppError('Career goal not found.', 404, 'GOAL_NOT_FOUND');
  }

  const updatedSkill = await skillRepository.addGoalToSkill(skillId, userId, goalId);

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.SKILL_MAPPED_TO_GOAL,
    resourceType: 'Skill',
    resourceId: skillId,
    metadata: { goalId },
  });

  return normalizeSkill(updatedSkill);
}

module.exports = {
  addSkill,
  getSkillsByUser,
  getSkillById,
  updateSkill,
  mapSkillToGoal,
  normalizeSkill,
};
