const projectRepository = require('./project.repository');
const { notify } = require('../notification/notification.service');
const auditLog = require('../auditlog/auditlog.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

// ── Auto-compute completionPercentage from task list ─────────────────────────
function computeCompletion(tasks = []) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}

// ── Derive status from completion ─────────────────────────────────────────────
function deriveStatus(percentage, currentStatus) {
  if (percentage === 100) return 'completed';
  if (percentage > 0)     return 'in_progress';
  // Don't override on_hold manually set by user
  if (currentStatus === 'on_hold') return 'on_hold';
  return 'planned';
}

function serializeProject(project) {
  if (!project) return null;
  return {
    id:                   project._id.toString(),
    userId:               project.userId.toString(),
    roadmapId:            project.roadmapId ? project.roadmapId.toString() : null,
    goalId:               project.goalId    ? project.goalId.toString()    : null,
    linkedStepOrder:      project.linkedStepOrder ?? null,
    title:                project.title,
    description:          project.description || '',
    status:               project.status,
    completionPercentage: project.completionPercentage,
    tasks: (project.tasks || []).map((t) => ({
      id:          t._id.toString(),
      title:       t.title,
      completed:   t.completed,
      completedAt: t.completedAt,
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

async function createProject(userId, payload) {
  const project = await projectRepository.createProject({
    userId,
    roadmapId:       payload.roadmapId       || null,
    goalId:          payload.goalId          || null,
    linkedStepOrder: payload.linkedStepOrder || null,
    title:           String(payload.title).trim(),
    description:     String(payload.description || '').trim(),
    status:          'planned',
    completionPercentage: 0,
  });

  auditLog.log({
    actorId: userId, actorRole: 'student',
    action: 'PROJECT_CREATED', resourceType: 'Project',
    resourceId: project._id.toString(),
    metadata: { title: project.title },
  });

  return serializeProject(project);
}

async function getProjects(userId, opts = {}) {
  const { projects, total } = await projectRepository.findProjectsByUserId(userId, opts);
  return { projects: projects.map(serializeProject), total };
}

async function getProjectById(userId, projectId) {
  const project = await projectRepository.findProjectByIdAndUserId(projectId, userId);
  if (!project) throw createAppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
  return serializeProject(project);
}

async function updateProject(userId, projectId, payload) {
  const existing = await projectRepository.findProjectByIdAndUserId(projectId, userId);
  if (!existing) throw createAppError('Project not found.', 404, 'PROJECT_NOT_FOUND');

  const updateData = {};
  if (payload.title       !== undefined) updateData.title       = String(payload.title).trim();
  if (payload.description !== undefined) updateData.description = String(payload.description).trim();
  if (payload.status      !== undefined) updateData.status      = payload.status;
  if (payload.linkedStepOrder !== undefined) updateData.linkedStepOrder = payload.linkedStepOrder;

  const updated = await projectRepository.updateProjectById(projectId, userId, updateData);

  auditLog.log({
    actorId: userId, actorRole: 'student',
    action: 'PROJECT_UPDATED', resourceType: 'Project', resourceId: projectId,
  });

  // Notify on completion
  if (payload.status === 'completed') {
    notify({
      userId,
      title: '🚀 Project completed!',
      message: `You've completed your project: "${updated.title}". Great work!`,
      type: 'project',
    });
  }

  return serializeProject(updated);
}

async function deleteProject(userId, projectId) {
  const deleted = await projectRepository.deleteProjectById(projectId, userId);
  if (!deleted) throw createAppError('Project not found.', 404, 'PROJECT_NOT_FOUND');

  auditLog.log({
    actorId: userId, actorRole: 'student',
    action: 'PROJECT_DELETED', resourceType: 'Project', resourceId: projectId,
  });

  return { deleted: true };
}

// ── Task operations ───────────────────────────────────────────────────────────

async function addTask(userId, projectId, payload) {
  const existing = await projectRepository.findProjectByIdAndUserId(projectId, userId);
  if (!existing) throw createAppError('Project not found.', 404, 'PROJECT_NOT_FOUND');

  const updated = await projectRepository.pushTask(projectId, userId, {
    title: String(payload.title).trim(),
    completed: false,
    completedAt: null,
  });

  // Recalculate completion
  const pct    = computeCompletion(updated.tasks);
  const status = deriveStatus(pct, updated.status);
  const final  = await projectRepository.updateProjectById(projectId, userId, {
    completionPercentage: pct,
    status,
  });

  return serializeProject(final);
}

async function updateTask(userId, projectId, taskId, payload) {
  const existing = await projectRepository.findProjectByIdAndUserId(projectId, userId);
  if (!existing) throw createAppError('Project not found.', 404, 'PROJECT_NOT_FOUND');

  const taskExists = existing.tasks.some((t) => t._id.toString() === taskId);
  if (!taskExists) throw createAppError('Task not found.', 404, 'TASK_NOT_FOUND');

  const updateData = {};
  if (payload.title     !== undefined) updateData.title     = String(payload.title).trim();
  if (payload.completed !== undefined) updateData.completed = Boolean(payload.completed);

  const updated = await projectRepository.updateTask(projectId, userId, taskId, updateData);

  // Recalculate completion
  const pct    = computeCompletion(updated.tasks);
  const status = deriveStatus(pct, updated.status);
  const final  = await projectRepository.updateProjectById(projectId, userId, {
    completionPercentage: pct,
    status,
  });

  return serializeProject(final);
}

async function deleteTask(userId, projectId, taskId) {
  const existing = await projectRepository.findProjectByIdAndUserId(projectId, userId);
  if (!existing) throw createAppError('Project not found.', 404, 'PROJECT_NOT_FOUND');

  const taskExists = existing.tasks.some((t) => t._id.toString() === taskId);
  if (!taskExists) throw createAppError('Task not found.', 404, 'TASK_NOT_FOUND');

  const updated = await projectRepository.removeTask(projectId, userId, taskId);

  // Recalculate completion
  const pct    = computeCompletion(updated.tasks);
  const status = deriveStatus(pct, updated.status);
  const final  = await projectRepository.updateProjectById(projectId, userId, {
    completionPercentage: pct,
    status,
  });

  return serializeProject(final);
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
};
