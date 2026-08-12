const auditLogRepository = require('./auditlog.repository');

// ─── Action constants ─────────────────────────────────────────────────────────
const ACTIONS = Object.freeze({
  // Auth
  USER_REGISTERED:        'USER_REGISTERED',
  USER_VERIFIED:          'USER_VERIFIED',
  USER_LOGGED_IN:         'USER_LOGGED_IN',

  // Profile
  PROFILE_CREATED:        'PROFILE_CREATED',
  PROFILE_UPDATED:        'PROFILE_UPDATED',

  // Career Goal
  GOAL_CREATED:           'GOAL_CREATED',
  GOAL_UPDATED:           'GOAL_UPDATED',
  GOAL_DELETED:           'GOAL_DELETED',

  // Skill
  SKILL_CREATED:          'SKILL_CREATED',
  SKILL_UPDATED:          'SKILL_UPDATED',
  SKILL_DELETED:          'SKILL_DELETED',
  SKILL_MAPPED_TO_GOAL:   'SKILL_MAPPED_TO_GOAL',

  // Gap Analysis
  GAP_ANALYSIS_GENERATED: 'GAP_ANALYSIS_GENERATED',

  // Roadmap
  ROADMAP_GENERATED:      'ROADMAP_GENERATED',

  // Progress
  PROGRESS_INITIALIZED:   'PROGRESS_INITIALIZED',
  PROGRESS_MILESTONE_UPDATED: 'PROGRESS_MILESTONE_UPDATED',
  PROGRESS_RESET:         'PROGRESS_RESET',
});

function serializeLog(log) {
  if (!log) return null;
  return {
    id: log._id.toString(),
    actorId: log.actorId.toString(),
    actorRole: log.actorRole,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId || null,
    metadata: log.metadata || {},
    timestamp: log.timestamp,
  };
}

/**
 * Write one audit entry.
 * Safe to call fire-and-forget — never throws.
 *
 * @param {object} opts
 * @param {string} opts.actorId    - User._id string
 * @param {string} opts.actorRole  - 'student' | 'mentor' | 'admin'
 * @param {string} opts.action     - one of ACTIONS
 * @param {string} opts.resourceType
 * @param {string} [opts.resourceId]
 * @param {object} [opts.metadata]
 */
async function log({ actorId, actorRole, action, resourceType, resourceId = null, metadata = {} }) {
  return auditLogRepository.createLog({
    actorId,
    actorRole,
    action,
    resourceType,
    resourceId,
    metadata,
    timestamp: new Date(),
  });
}

/**
 * Admin-only: paginated list with filters.
 */
async function getLogs(filters, page, limit) {
  const { logs, total } = await auditLogRepository.listLogs(filters, page, limit);
  return {
    logs: logs.map(serializeLog),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Admin-only: single log by id.
 */
async function getLogById(id) {
  const log = await auditLogRepository.findLogById(id);
  if (!log) {
    const err = new Error('Audit log not found.');
    err.statusCode = 404;
    err.code = 'AUDIT_LOG_NOT_FOUND';
    throw err;
  }
  return serializeLog(log);
}

module.exports = {
  log,
  getLogs,
  getLogById,
  ACTIONS,
};
