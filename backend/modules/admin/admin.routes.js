const express = require('express');
const adminController = require('./admin.controller');
const { requireAuth, authorizeRoles } = require('../auth/auth.middleware');
const { ROLES } = require('../auth/auth.constants');
const {
  updateRoleSchema,
  idParamsSchema,
  listUsersQuerySchema,
  validateBody,
  validateParams,
  validateQuery,
} = require('./admin.validators');

const router = express.Router();

// All routes are admin-only
router.use(requireAuth, authorizeRoles(ROLES.ADMIN));

// GET  /api/v1/admin/dashboard
router.get('/dashboard', adminController.getDashboardStats);

// GET  /api/v1/admin/users
router.get('/users', validateQuery(listUsersQuerySchema), adminController.listUsers);

// PATCH /api/v1/admin/users/:id/role
router.patch(
  '/users/:id/role',
  validateParams(idParamsSchema),
  validateBody(updateRoleSchema),
  adminController.updateUserRole
);

// DELETE /api/v1/admin/users/:id
router.delete(
  '/users/:id',
  validateParams(idParamsSchema),
  adminController.deleteUser
);

module.exports = router;
