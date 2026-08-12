const { failure, success } = require('../../utils/response');
const careerGoalService = require('./careergoal.service');
const { parsePagination, parseSort, paginationMeta } = require('../../utils/queryHelpers');

const ALLOWED_SORT = ['createdAt', 'updatedAt', 'title', 'targetRole', 'priority', 'status'];

async function createGoal(req, res, next) {
  try {
    const goal = await careerGoalService.createCareerGoal(req.user.id, req.body);
    return res.status(201).json({ data: { goal }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

async function getGoals(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT);
    const sortBy    = Object.keys(sort)[0];
    const sortOrder = Object.values(sort)[0];

    const { goals, total } = await careerGoalService.getGoalsByUser(req.user.id, {
      search:   req.query.search,
      status:   req.query.status,
      priority: req.query.priority,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    return success(res, { goals }, paginationMeta(total, page, limit));
  } catch (error) {
    return next(error);
  }
}

async function getGoalById(req, res, next) {
  try {
    const goal = await careerGoalService.getGoalById(req.user.id, req.params.id);
    return success(res, { goal });
  } catch (error) {
    return next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await careerGoalService.updateGoal(req.user.id, req.params.id, req.body);
    return success(res, { goal });
  } catch (error) {
    return next(error);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const result = await careerGoalService.deleteGoal(req.user.id, req.params.id);
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createGoal, getGoals, getGoalById, updateGoal, deleteGoal };
