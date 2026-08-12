const Roadmap = require('./roadmap.model');

const ROADMAP_SELECT = 'userId goalId goalTitle roadmapTitle estimatedDuration targetRole overview sourceMatchedSkills sourceMissingSkills steps totalEstimatedDays status createdAt updatedAt';

async function findRoadmapByUserIdAndGoalId(userId, goalId) {
  return Roadmap.findOne({ userId, goalId }).select(ROADMAP_SELECT);
}

async function findRoadmapByIdAndUserId(roadmapId, userId) {
  return Roadmap.findOne({ _id: roadmapId, userId }).select(ROADMAP_SELECT);
}

/**
 * List roadmaps with search / filter / sort / pagination.
 */
async function listRoadmapsByUserId(userId, opts = {}) {
  const {
    search, status,
    sortBy = 'createdAt', sortOrder = -1,
    skip = 0, limit = 20,
  } = opts;

  const query = { userId };

  if (search) {
    query.$or = [
      { goalTitle:  { $regex: search, $options: 'i' } },
      { targetRole: { $regex: search, $options: 'i' } },
      { overview:   { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const sort = { [sortBy]: sortOrder };

  const [roadmaps, total] = await Promise.all([
    Roadmap.find(query).sort(sort).skip(skip).limit(limit).select(ROADMAP_SELECT),
    Roadmap.countDocuments(query),
  ]);

  return { roadmaps, total };
}

async function upsertRoadmap(filter, roadmapData) {
  return Roadmap.findOneAndUpdate(
    filter,
    { $set: roadmapData },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).select(ROADMAP_SELECT);
}

module.exports = {
  findRoadmapByUserIdAndGoalId,
  findRoadmapByIdAndUserId,
  listRoadmapsByUserId,
  upsertRoadmap,
  ROADMAP_SELECT,
};
