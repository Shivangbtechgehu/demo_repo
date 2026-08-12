const careerGoalRepository = require('./careergoal.repository');
const auditLog = require('../auditlog/auditlog.service');
const { notify } = require('../notification/notification.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function normalizeGoal(goal) {
  if (!goal) {
    return null;
  }

  return {
    id: goal._id.toString(),
    userId: goal.userId.toString(),
    title: goal.title,
    targetRole: goal.targetRole,
    description: goal.description || '',
    targetDate: goal.targetDate,
    priority: goal.priority,
    status: goal.status,
    notes: goal.notes || '',
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

function normalizeUpdateData(payload) {
  const updateData = {};

  if (payload.title !== undefined) {
    updateData.title = String(payload.title).trim();
  }

  if (payload.targetRole !== undefined) {
    updateData.targetRole = String(payload.targetRole).trim();
  }

  if (payload.description !== undefined) {
    updateData.description = String(payload.description).trim();
  }

  if (payload.targetDate !== undefined && payload.targetDate !== '') {
    updateData.targetDate = new Date(payload.targetDate);
  }

  if (payload.priority !== undefined) {
    updateData.priority = payload.priority;
  }

  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }

  if (payload.notes !== undefined) {
    updateData.notes = String(payload.notes).trim();
  }

  return updateData;
}

async function createCareerGoal(userId, payload) {
  const goal = await careerGoalRepository.createGoal({
    userId,
    title: String(payload.title).trim(),
    targetRole: String(payload.targetRole).trim(),
    description: String(payload.description || '').trim(),
    targetDate: payload.targetDate ? new Date(payload.targetDate) : null,
    priority: payload.priority || 'medium',
    status: payload.status || 'active',
    notes: String(payload.notes || '').trim(),
  });

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.GOAL_CREATED,
    resourceType: 'CareerGoal',
    resourceId: goal._id.toString(),
    metadata: { title: goal.title, targetRole: goal.targetRole },
  });

  return normalizeGoal(goal);
}

async function getGoalsByUser(userId, opts = {}) {
  const { goals, total } = await careerGoalRepository.findGoalsByUserId(userId, opts);
  return { goals: goals.map(normalizeGoal), total };
}

async function getGoalById(userId, goalId) {
  const goal = await careerGoalRepository.findGoalByIdAndUserId(goalId, userId);

  if (!goal) {
    throw createAppError('Career goal not found.', 404, 'GOAL_NOT_FOUND');
  }

  return normalizeGoal(goal);
}

async function updateGoal(userId, goalId, payload) {
  const existingGoal = await careerGoalRepository.findGoalByIdAndUserId(goalId, userId);

  if (!existingGoal) {
    throw createAppError('Career goal not found.', 404, 'GOAL_NOT_FOUND');
  }

  const updateData = normalizeUpdateData(payload);
  const updatedGoal = await careerGoalRepository.updateGoalByIdAndUserId(goalId, userId, updateData);

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.GOAL_UPDATED,
    resourceType: 'CareerGoal',
    resourceId: goalId,
  });

  // Notify when goal is marked completed
  if (updateData.status === 'completed') {
    notify({
      userId,
      title: '🎯 Goal completed!',
      message: `Congratulations! You've completed your goal: "${updatedGoal.title}".`,
      type: 'goal',
    });
  }

  return normalizeGoal(updatedGoal);
}

async function deleteGoal(userId, goalId) {
  const deletedGoal = await careerGoalRepository.deleteGoalByIdAndUserId(goalId, userId);

  if (!deletedGoal) {
    throw createAppError('Career goal not found.', 404, 'GOAL_NOT_FOUND');
  }

  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.GOAL_DELETED,
    resourceType: 'CareerGoal',
    resourceId: goalId,
  });

  return { deleted: true };
}

module.exports = {
  createCareerGoal,
  getGoalsByUser,
  getGoalById,
  updateGoal,
  deleteGoal,
  normalizeGoal,
};
