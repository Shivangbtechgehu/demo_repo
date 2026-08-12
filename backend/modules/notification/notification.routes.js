const express = require('express');
const notificationController = require('./notification.controller');
const { requireAuth } = require('../auth/auth.middleware');
const { notificationParamsSchema, validateParams } = require('./notification.validators');

const router = express.Router();

// GET  /api/v1/notifications — list all + unread count
router.get('/', requireAuth, notificationController.getNotifications);

// PATCH /api/v1/notifications/read-all — mark all as read (must be before /:id)
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read — mark one as read
router.patch(
  '/:id/read',
  requireAuth,
  validateParams(notificationParamsSchema),
  notificationController.markAsRead
);

// DELETE /api/v1/notifications/:id — delete one
router.delete(
  '/:id',
  requireAuth,
  validateParams(notificationParamsSchema),
  notificationController.deleteNotification
);

module.exports = router;
