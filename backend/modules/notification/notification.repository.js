const Notification = require('./notification.model');

const NOTIFICATION_SELECT = 'userId title message type read createdAt';

async function createNotification(data) {
  try {
    return await Notification.create(data);
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
    return null;
  }
}

/**
 * List notifications with filter / sort / pagination.
 */
async function findNotificationsByUserId(userId, opts = {}) {
  const {
    type, read,
    sortBy = 'createdAt', sortOrder = -1,
    skip = 0, limit = 20,
  } = opts;

  const query = { userId };

  if (type !== undefined && type !== '')        query.type = type;
  if (read !== undefined && read !== '')        query.read = read === 'true' || read === true;

  const sort = { [sortBy]: sortOrder };

  const [notifications, total] = await Promise.all([
    Notification.find(query).sort(sort).skip(skip).limit(limit).select(NOTIFICATION_SELECT),
    Notification.countDocuments(query),
  ]);

  return { notifications, total };
}

async function countUnread(userId) {
  return Notification.countDocuments({ userId, read: false });
}

async function findNotificationByIdAndUserId(id, userId) {
  return Notification.findOne({ _id: id, userId }).select(NOTIFICATION_SELECT);
}

async function markOneRead(id, userId) {
  return Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { read: true } },
    { new: true }
  ).select(NOTIFICATION_SELECT);
}

async function markAllRead(userId) {
  return Notification.updateMany({ userId, read: false }, { $set: { read: true } });
}

async function deleteNotification(id, userId) {
  return Notification.findOneAndDelete({ _id: id, userId });
}

module.exports = {
  createNotification,
  findNotificationsByUserId,
  countUnread,
  findNotificationByIdAndUserId,
  markOneRead,
  markAllRead,
  deleteNotification,
};
