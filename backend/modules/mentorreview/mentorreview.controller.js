const { success } = require('../../utils/response');
const mentorReviewService = require('./mentorreview.service');

// POST /api/v1/mentor-reviews — mentor only
async function createReview(req, res, next) {
  try {
    const review = await mentorReviewService.createReview(
      req.user.id,
      req.user.role,
      req.body
    );
    return res.status(201).json({ data: { review }, meta: {}, error: null });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/mentor-reviews/:roadmapId — student sees own, mentor sees own, admin sees all
async function getReviewsByRoadmap(req, res, next) {
  try {
    const reviews = await mentorReviewService.getReviewsByRoadmap(req.params.roadmapId);
    return success(res, { reviews });
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/v1/mentor-reviews/:id — mentor only
async function updateReview(req, res, next) {
  try {
    const review = await mentorReviewService.updateReview(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body
    );
    return success(res, { review });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/mentor-reviews/admin/all — admin only
async function getAllReviews(req, res, next) {
  try {
    const { status, mentorId, studentId } = req.query;
    const reviews = await mentorReviewService.getAllReviews({ status, mentorId, studentId });
    return success(res, { reviews });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/mentor-reviews/dashboard — mentor only
async function getMentorDashboard(req, res, next) {
  try {
    const reviews = await mentorReviewService.getMentorDashboard(req.user.id);
    return success(res, { reviews });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createReview,
  getReviewsByRoadmap,
  updateReview,
  getAllReviews,
  getMentorDashboard,
};
