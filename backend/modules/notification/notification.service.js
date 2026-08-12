const notificationRepository = require('./notification.repository');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function serializeNotification(n) {
  if (!n) return null;
  return {
    id: n._id.toString(),
    userId: n.userId.toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
  };
}

// ─── Fire-and-forget helper used by other modules ────────────────────────────

/**
 * Create a notification without blocking the caller.
 * Safe to call without await.
 */
async function notify({ userId, title, message, type = 'system' }) {
  return notificationRepository.createNotification({ userId, title, message, type });
}

// ─── User-facing service methods ─────────────────────────────────────────────

async function getNotifications(userId, opts = {}) {
  const { notifications, total } = await notificationRepository.findNotificationsByUserId(userId, opts);
  const unreadCount = await notificationRepository.countUnread(userId);
  return {
    notifications: notifications.map(serializeNotification),
    unreadCount,
    total,
  };
}

async function markAsRead(userId, notificationId) {
  const notification = await notificationRepository.markOneRead(notificationId, userId);
  if (!notification) {
    throw createAppError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND');
  }
  return serializeNotification(notification);
}

async function markAllAsRead(userId) {
  await notificationRepository.markAllRead(userId);
  return { success: true };
}

async function deleteNotification(userId, notificationId) {
  const deleted = await notificationRepository.deleteNotification(notificationId, userId);
  if (!deleted) {
    throw createAppError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND');
  }
  return { deleted: true };
}

module.exports = {
  notify,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
