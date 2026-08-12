const express = require('express');
const auditLogController = require('./auditlog.controller');
const { requireAuth, authorizeRoles } = require('../auth/auth.middleware');
const { ROLES } = require('../auth/auth.constants');
const {
  auditLogParamsSchema,
  auditLogQuerySchema,
  validateParams,
  validateQuery,
} = require('./auditlog.validators');

const router = express.Router();

// Both routes are admin-only
router.get(
  '/',
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validateQuery(auditLogQuerySchema),
  auditLogController.listLogs
);

router.get(
  '/:id',
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  validateParams(auditLogParamsSchema),
  auditLogController.getLogById
);

module.exports = router;
