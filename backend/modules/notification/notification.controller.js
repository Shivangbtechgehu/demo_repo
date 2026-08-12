const { success } = require('../../utils/response');
const notificationService = require('./notification.service');
const { parsePagination, parseSort, paginationMeta } = require('../../utils/queryHelpers');

const ALLOWED_SORT = ['createdAt', 'type', 'read'];

async function getNotifications(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, ALLOWED_SORT);
    const sortBy    = Object.keys(sort)[0];
    const sortOrder = Object.values(sort)[0];

    const result = await notificationService.getNotifications(req.user.id, {
      type:      req.query.type,
      read:      req.query.read,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    return success(res, result, paginationMeta(result.total, page, limit));
  } catch (error) {
    return next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    return success(res, { notification });
  } catch (error) {
    return next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const result = await notificationService.deleteNotification(req.user.id, req.params.id);
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
