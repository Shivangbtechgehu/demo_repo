const GapAnalysis = require('./gapanalysis.model');

const GAP_SELECT = 'userId goalId goalTitle targetRole requiredSkills matchedSkills missingSkills completionPercentage createdAt updatedAt';

async function findAnalysisByUserIdAndGoalId(userId, goalId) {
  return GapAnalysis.findOne({ userId, goalId }).select(GAP_SELECT);
}

async function upsertAnalysis(filter, updateData) {
  return GapAnalysis.findOneAndUpdate(
    filter,
    { $set: updateData },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).select(GAP_SELECT);
}

module.exports = {
  findAnalysisByUserIdAndGoalId,
  upsertAnalysis,
  GAP_SELECT,
};
