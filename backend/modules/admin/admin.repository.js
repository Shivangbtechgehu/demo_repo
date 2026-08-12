const User = require('../../models/User');

const ADMIN_USER_SELECT = 'name email role isEmailVerified createdAt profileImage';

async function countByRole(role) {
  return User.countDocuments({ role });
}

async function countAll() {
  return User.countDocuments();
}

async function listUsers(filters = {}, page = 1, limit = 20) {
  const query = {};
  if (filters.role)  query.role  = filters.role;
  if (filters.email) query.email = { $regex: filters.email, $options: 'i' };

  const skip  = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(ADMIN_USER_SELECT);

  return { users, total };
}

async function updateUserRole(userId, role) {
  return User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { new: true, runValidators: true }
  ).select(ADMIN_USER_SELECT);
}

async function deleteUser(userId) {
  return User.findByIdAndDelete(userId);
}

// Recent users for dashboard table
async function getRecentUsers(limit = 5) {
  return User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(ADMIN_USER_SELECT);
}

// User growth: count per day for last N days
async function getUserGrowthByDay(days = 7) {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  return User.aggregate([
    { $match: { createdAt: { $gte: from } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

module.exports = {
  countByRole,
  countAll,
  listUsers,
  updateUserRole,
  deleteUser,
  getRecentUsers,
  getUserGrowthByDay,
  ADMIN_USER_SELECT,
};
