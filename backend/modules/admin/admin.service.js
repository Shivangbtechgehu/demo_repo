const adminRepository = require('./admin.repository');
const auditLogRepository = require('../auditlog/auditlog.repository');
const auditLog = require('../auditlog/auditlog.service');

// Lazy-require to avoid circular deps at startup
function getModel(name) {
  return require('mongoose').model(name);
}

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function serializeUser(user) {
  if (!user) return null;
  return {
    id:              user._id.toString(),
    name:            user.name,
    email:           user.email,
    role:            user.role,
    isEmailVerified: user.isEmailVerified,
    profileImage:    user.profileImage || '',
    createdAt:       user.createdAt,
  };
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

async function getDashboardStats() {
  const [
    totalUsers,
    totalStudents,
    totalMentors,
    totalAdmins,
    totalGoals,
    totalSkills,
    totalRoadmaps,
    totalProjects,
    totalNotifications,
    recentUsers,
    recentLogs,
    userGrowth,
  ] = await Promise.all([
    adminRepository.countAll(),
    adminRepository.countByRole('student'),
    adminRepository.countByRole('mentor'),
    adminRepository.countByRole('admin'),
    getModel('CareerGoal').countDocuments(),
    getModel('Skill').countDocuments(),
    getModel('Roadmap').countDocuments(),
    getModel('Project').countDocuments(),
    getModel('Notification').countDocuments(),
    adminRepository.getRecentUsers(5),
    auditLogRepository.listLogs({}, 1, 5),
    adminRepository.getUserGrowthByDay(7),
  ]);

  // Roadmap completion rate
  const completedRoadmaps = await getModel('Roadmap').countDocuments({ status: 'completed' });
  const roadmapCompletionRate = totalRoadmaps > 0
    ? Math.round((completedRoadmaps / totalRoadmaps) * 100)
    : 0;

  return {
    stats: {
      totalUsers,
      totalStudents,
      totalMentors,
      totalAdmins,
      totalGoals,
      totalSkills,
      totalRoadmaps,
      totalProjects,
      totalNotifications,
      roadmapCompletionRate,
    },
    recentUsers: recentUsers.map(serializeUser),
    recentAuditLogs: recentLogs.logs,
    userGrowth: userGrowth.map((d) => ({ date: d._id, count: d.count })),
  };
}

// ── User management ───────────────────────────────────────────────────────────

async function listUsers(filters, page, limit) {
  const { users, total } = await adminRepository.listUsers(filters, page, limit);
  return {
    users: users.map(serializeUser),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateUserRole(actorId, actorRole, userId, role) {
  if (actorId === userId) {
    throw createAppError('You cannot change your own role.', 400, 'SELF_ROLE_CHANGE');
  }

  const updated = await adminRepository.updateUserRole(userId, role);
  if (!updated) throw createAppError('User not found.', 404, 'USER_NOT_FOUND');

  auditLog.log({
    actorId, actorRole,
    action: 'ADMIN_USER_ROLE_CHANGED',
    resourceType: 'User',
    resourceId: userId,
    metadata: { newRole: role },
  });

  return serializeUser(updated);
}

async function deleteUser(actorId, actorRole, userId) {
  if (actorId === userId) {
    throw createAppError('You cannot delete your own account.', 400, 'SELF_DELETE');
  }

  const deleted = await adminRepository.deleteUser(userId);
  if (!deleted) throw createAppError('User not found.', 404, 'USER_NOT_FOUND');

  auditLog.log({
    actorId, actorRole,
    action: 'ADMIN_USER_DELETED',
    resourceType: 'User',
    resourceId: userId,
    metadata: { email: deleted.email },
  });

  return { deleted: true };
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUserRole,
  deleteUser,
};
