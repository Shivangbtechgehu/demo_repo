const { success } = require('../../utils/response');
const projectService = require('./project.service');
const { parsePagination, parseSort, paginationMeta } = require('../../utils/queryHelpers');

const ALLOWED_SORT = ['createdAt', 'updatedAt', 'title', 'status', 'completionPercentage'];

async function createProject(req, res, next) {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    return res.status(201).json({ data: { project }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

async function getProjects(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT);
    const sortBy    = Object.keys(sort)[0];
    const sortOrder = Object.values(sort)[0];

    const { projects, total } = await projectService.getProjects(req.user.id, {
      search: req.query.search,
      status: req.query.status,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    return success(res, { projects }, paginationMeta(total, page, limit));
  } catch (error) {
    return next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.user.id, req.params.id);
    return success(res, { project });
  } catch (error) {
    return next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
    return success(res, { project });
  } catch (error) {
    return next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.user.id, req.params.id);
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

async function addTask(req, res, next) {
  try {
    const project = await projectService.addTask(req.user.id, req.params.id, req.body);
    return res.status(201).json({ data: { project }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const project = await projectService.updateTask(
      req.user.id, req.params.projectId, req.params.taskId, req.body
    );
    return success(res, { project });
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const project = await projectService.deleteTask(
      req.user.id, req.params.projectId, req.params.taskId
    );
    return success(res, { project });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject,
  addTask, updateTask, deleteTask,
};
