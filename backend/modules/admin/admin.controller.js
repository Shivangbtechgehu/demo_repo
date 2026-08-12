const { success } = require('../../utils/response');
const adminService = require('./admin.service');

async function getDashboardStats(req, res, next) {
  try {
    const data = await adminService.getDashboardStats();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const { role, email, page = 1, limit = 20 } = req.query;
    const result = await adminService.listUsers(
      { role, email },
      Math.max(1, Number(page)),
      Math.min(100, Math.max(1, Number(limit)))
    );
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const user = await adminService.updateUserRole(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body.role
    );
    return success(res, { user });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await adminService.deleteUser(
      req.user.id,
      req.user.role,
      req.params.id
    );
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUserRole,
  deleteUser,
};
