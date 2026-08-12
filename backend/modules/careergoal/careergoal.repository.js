const CareerGoal = require('./careergoal.model');

const GOAL_SELECT = 'userId title targetRole description targetDate priority status notes createdAt updatedAt';

async function createGoal(goalData) {
  return CareerGoal.create(goalData);
}

/**
 * List goals with search / filter / sort / pagination.
 */
async function findGoalsByUserId(userId, opts = {}) {
  const { search, status, priority, sortBy = 'createdAt', sortOrder = -1, skip = 0, limit = 20 } = opts;

  const query = { userId };

  if (search) {
    query.$or = [
      { title:      { $regex: search, $options: 'i' } },
      { targetRole: { $regex: search, $options: 'i' } },
      { description:{ $regex: search, $options: 'i' } },
    ];
  }
  if (status)   query.status   = status;
  if (priority) query.priority = priority;

  const sort = { [sortBy]: sortOrder };

  const [goals, total] = await Promise.all([
    CareerGoal.find(query).sort(sort).skip(skip).limit(limit).select(GOAL_SELECT),
    CareerGoal.countDocuments(query),
  ]);

  return { goals, total };
}

async function findGoalByIdAndUserId(goalId, userId) {
  return CareerGoal.findOne({ _id: goalId, userId }).select(GOAL_SELECT);
}

async function updateGoalByIdAndUserId(goalId, userId, updateData) {
  return CareerGoal.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select(GOAL_SELECT);
}

async function deleteGoalByIdAndUserId(goalId, userId) {
  return CareerGoal.findOneAndDelete({ _id: goalId, userId });
}

module.exports = {
  createGoal,
  findGoalsByUserId,
  findGoalByIdAndUserId,
  updateGoalByIdAndUserId,
  deleteGoalByIdAndUserId,
  GOAL_SELECT,
};
