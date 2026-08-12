const { success } = require('../../utils/response');
const auditLogService = require('./auditlog.service');
const { parsePagination, paginationMeta } = require('../../utils/queryHelpers');

async function listLogs(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);

    const filters = {
      actorId:      req.query.actorId      || undefined,
      action:       req.query.action       || undefined,
      resourceType: req.query.resourceType || undefined,
      fromDate:     req.query.fromDate     || undefined,
      toDate:       req.query.toDate       || undefined,
      sortBy:       req.query.sortBy       || 'timestamp',
      sortOrder:    req.query.sortOrder === 'asc' ? 1 : -1,
    };

    const result = await auditLogService.getLogs(filters, page, limit);

    return success(res, result, paginationMeta(result.pagination.total, page, limit));
  } catch (error) {
    return next(error);
  }
}

async function getLogById(req, res, next) {
  try {
    const auditLog = await auditLogService.getLogById(req.params.id);
    return success(res, { auditLog });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listLogs, getLogById };
