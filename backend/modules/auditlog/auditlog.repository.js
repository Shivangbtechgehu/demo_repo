const AuditLog = require('./auditlog.model');

async function createLog(data) {
  try {
    return await AuditLog.create(data);
  } catch (err) {
    console.error('[AuditLog] Failed to write audit entry:', err.message);
    return null;
  }
}

/**
 * List audit logs with filter / sort / pagination.
 */
async function listLogs(filters = {}, page = 1, limit = 20) {
  const {
    actorId, action, resourceType,
    fromDate, toDate,
    sortBy = 'timestamp', sortOrder = -1,
  } = filters;

  const query = {};

  if (actorId)      query.actorId      = actorId;
  if (action)       query.action       = { $regex: action, $options: 'i' };
  if (resourceType) query.resourceType = resourceType;

  if (fromDate || toDate) {
    query.timestamp = {};
    if (fromDate) query.timestamp.$gte = new Date(fromDate);
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      query.timestamp.$lte = to;
    }
  }

  const allowedSort = ['timestamp', 'action', 'resourceType'];
  const sortField   = allowedSort.includes(sortBy) ? sortBy : 'timestamp';
  const sort        = { [sortField]: sortOrder === 1 || sortOrder === 'asc' ? 1 : -1 };

  const skip  = (page - 1) * limit;
  const total = await AuditLog.countDocuments(query);
  const logs  = await AuditLog.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  return { logs, total };
}

async function findLogById(id) {
  return AuditLog.findById(id).lean();
}

module.exports = {
  createLog,
  listLogs,
  findLogById,
};
