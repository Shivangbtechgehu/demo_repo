const Project = require('./project.model');

const PROJECT_SELECT =
  'userId roadmapId goalId linkedStepOrder title description status completionPercentage tasks createdAt updatedAt';

async function createProject(data) {
  return Project.create(data);
}

/**
 * List projects with search / filter / sort / pagination.
 */
async function findProjectsByUserId(userId, opts = {}) {
  const {
    search, status,
    sortBy = 'createdAt', sortOrder = -1,
    skip = 0, limit = 20,
  } = opts;

  const query = { userId };

  if (search) {
    query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const sort = { [sortBy]: sortOrder };

  const [projects, total] = await Promise.all([
    Project.find(query).sort(sort).skip(skip).limit(limit).select(PROJECT_SELECT),
    Project.countDocuments(query),
  ]);

  return { projects, total };
}

async function findProjectByIdAndUserId(id, userId) {
  return Project.findOne({ _id: id, userId }).select(PROJECT_SELECT);
}

async function updateProjectById(id, userId, updateData) {
  return Project.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select(PROJECT_SELECT);
}

async function deleteProjectById(id, userId) {
  return Project.findOneAndDelete({ _id: id, userId });
}

async function pushTask(projectId, userId, taskData) {
  return Project.findOneAndUpdate(
    { _id: projectId, userId },
    { $push: { tasks: taskData } },
    { new: true, runValidators: true }
  ).select(PROJECT_SELECT);
}

async function updateTask(projectId, userId, taskId, updateData) {
  const setFields = {};
  if (updateData.title     !== undefined) setFields['tasks.$.title']       = updateData.title;
  if (updateData.completed !== undefined) setFields['tasks.$.completed']   = updateData.completed;
  if (updateData.completed === true)      setFields['tasks.$.completedAt'] = new Date();
  if (updateData.completed === false)     setFields['tasks.$.completedAt'] = null;

  return Project.findOneAndUpdate(
    { _id: projectId, userId, 'tasks._id': taskId },
    { $set: setFields },
    { new: true }
  ).select(PROJECT_SELECT);
}

async function removeTask(projectId, userId, taskId) {
  return Project.findOneAndUpdate(
    { _id: projectId, userId },
    { $pull: { tasks: { _id: taskId } } },
    { new: true }
  ).select(PROJECT_SELECT);
}

module.exports = {
  createProject,
  findProjectsByUserId,
  findProjectByIdAndUserId,
  updateProjectById,
  deleteProjectById,
  pushTask,
  updateTask,
  removeTask,
  PROJECT_SELECT,
};
