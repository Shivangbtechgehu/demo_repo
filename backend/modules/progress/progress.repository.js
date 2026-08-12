const Progress = require('./progress.model');

const PROGRESS_SELECT =
  'userId roadmapId goalId milestones totalSteps completedSteps progressPercentage status createdAt updatedAt';

async function findProgressByUserIdAndRoadmapId(userId, roadmapId) {
  return Progress.findOne({ userId, roadmapId }).select(PROGRESS_SELECT);
}

async function findProgressByIdAndUserId(progressId, userId) {
  return Progress.findOne({ _id: progressId, userId }).select(PROGRESS_SELECT);
}

async function listProgressByUserId(userId) {
  return Progress.find({ userId }).sort({ updatedAt: -1 }).select(PROGRESS_SELECT);
}

async function createProgress(progressData) {
  const progress = new Progress(progressData);
  return progress.save();
}

async function updateProgressById(progressId, updateData) {
  return Progress.findByIdAndUpdate(
    progressId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select(PROGRESS_SELECT);
}

async function deleteProgressByUserIdAndRoadmapId(userId, roadmapId) {
  return Progress.findOneAndDelete({ userId, roadmapId });
}

module.exports = {
  findProgressByUserIdAndRoadmapId,
  findProgressByIdAndUserId,
  listProgressByUserId,
  createProgress,
  updateProgressById,
  deleteProgressByUserIdAndRoadmapId,
  PROGRESS_SELECT,
};
