const { success } = require('../../utils/response');
const skillService = require('./skill.service');
const { parsePagination, parseSort, paginationMeta } = require('../../utils/queryHelpers');

const ALLOWED_SORT = ['createdAt', 'updatedAt', 'name', 'category', 'proficiencyLevel'];

async function addSkill(req, res, next) {
  try {
    const skill = await skillService.addSkill(req.user.id, req.body);
    return res.status(201).json({ data: { skill }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

async function getSkills(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT);
    const sortBy    = Object.keys(sort)[0];
    const sortOrder = Object.values(sort)[0];

    const { skills, total } = await skillService.getSkillsByUser(req.user.id, {
      search:           req.query.search,
      category:         req.query.category,
      proficiencyLevel: req.query.proficiencyLevel,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    return success(res, { skills }, paginationMeta(total, page, limit));
  } catch (error) {
    return next(error);
  }
}

async function getSkillById(req, res, next) {
  try {
    const skill = await skillService.getSkillById(req.user.id, req.params.id);
    return success(res, { skill });
  } catch (error) {
    return next(error);
  }
}

async function updateSkill(req, res, next) {
  try {
    const skill = await skillService.updateSkill(req.user.id, req.params.id, req.body);
    return success(res, { skill });
  } catch (error) {
    return next(error);
  }
}

async function mapSkillToGoal(req, res, next) {
  try {
    const skill = await skillService.mapSkillToGoal(req.user.id, req.params.id, req.body.goalId);
    return success(res, { skill });
  } catch (error) {
    return next(error);
  }
}

module.exports = { addSkill, getSkills, getSkillById, updateSkill, mapSkillToGoal };
