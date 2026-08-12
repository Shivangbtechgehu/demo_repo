const { success } = require('../../utils/response');
const roadmapService = require('./roadmap.service');
const { parsePagination, parseSort, paginationMeta } = require('../../utils/queryHelpers');

const ALLOWED_SORT = ['createdAt', 'updatedAt', 'goalTitle', 'targetRole', 'totalEstimatedDays', 'status'];

async function generateRoadmap(req, res, next) {
  try {
    const roadmap = await roadmapService.generateRoadmap(req.user.id, req.body.goalId);
    return res.status(201).json({ data: { roadmap }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

async function getRoadmaps(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT);
    const sortBy    = Object.keys(sort)[0];
    const sortOrder = Object.values(sort)[0];

    const { roadmaps, total } = await roadmapService.listRoadmaps(req.user.id, {
      search: req.query.search,
      status: req.query.status,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    return success(res, { roadmaps }, paginationMeta(total, page, limit));
  } catch (error) {
    return next(error);
  }
}

async function getRoadmapById(req, res, next) {
  try {
    const roadmap = await roadmapService.getRoadmapById(req.user.id, req.params.id);
    return success(res, { roadmap });
  } catch (error) {
    return next(error);
  }
}

module.exports = { generateRoadmap, getRoadmaps, getRoadmapById };
