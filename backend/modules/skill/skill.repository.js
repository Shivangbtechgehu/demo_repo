const Skill = require('./skill.model');

const SKILL_SELECT = 'userId name category proficiencyLevel notes mappedGoalIds createdAt updatedAt';

async function createSkill(skillData) {
  return Skill.create(skillData);
}

/**
 * List skills with search / filter / sort / pagination.
 */
async function findSkillsByUserId(userId, opts = {}) {
  const {
    search, category, proficiencyLevel,
    sortBy = 'createdAt', sortOrder = -1,
    skip = 0, limit = 20,
  } = opts;

  const query = { userId };

  if (search) {
    query.$or = [
      { name:     { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { notes:    { $regex: search, $options: 'i' } },
    ];
  }
  if (category)         query.category         = { $regex: category, $options: 'i' };
  if (proficiencyLevel) query.proficiencyLevel  = proficiencyLevel;

  const sort = { [sortBy]: sortOrder };

  const [skills, total] = await Promise.all([
    Skill.find(query).sort(sort).skip(skip).limit(limit).select(SKILL_SELECT),
    Skill.countDocuments(query),
  ]);

  return { skills, total };
}

async function findSkillByNameAndUserId(userId, name) {
  return Skill.findOne({ userId, name }).select(SKILL_SELECT);
}

async function findSkillByIdAndUserId(skillId, userId) {
  return Skill.findOne({ _id: skillId, userId }).select(SKILL_SELECT);
}

async function updateSkillByIdAndUserId(skillId, userId, updateData) {
  return Skill.findOneAndUpdate(
    { _id: skillId, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select(SKILL_SELECT);
}

async function addGoalToSkill(skillId, userId, goalId) {
  return Skill.findOneAndUpdate(
    { _id: skillId, userId },
    { $addToSet: { mappedGoalIds: goalId } },
    { new: true, runValidators: true }
  ).select(SKILL_SELECT);
}

module.exports = {
  createSkill,
  findSkillsByUserId,
  findSkillByNameAndUserId,
  findSkillByIdAndUserId,
  updateSkillByIdAndUserId,
  addGoalToSkill,
  SKILL_SELECT,
};
