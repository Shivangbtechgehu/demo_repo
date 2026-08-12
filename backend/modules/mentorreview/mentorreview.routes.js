const express = require('express');
const mentorReviewController = require('./mentorreview.controller');
const { requireAuth, authorizeRoles } = require('../auth/auth.middleware');
const { ROLES } = require('../auth/auth.constants');
const {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  roadmapParamsSchema,
  validateBody,
  validateParams,
} = require('./mentorreview.validators');

const router = express.Router();

// GET  /api/v1/mentor-reviews/dashboard — mentor's own review history
router.get(
  '/dashboard',
  requireAuth,
  authorizeRoles(ROLES.MENTOR),
  mentorReviewController.getMentorDashboard
);

// GET  /api/v1/mentor-reviews/admin/all — admin: all reviews with optional filters
router.get(
  '/admin/all',
  requireAuth,
  authorizeRoles(ROLES.ADMIN),
  mentorReviewController.getAllReviews
);

// POST /api/v1/mentor-reviews — mentor creates a review
router.post(
  '/',
  requireAuth,
  authorizeRoles(ROLES.MENTOR),
  validateBody(createReviewSchema),
  mentorReviewController.createReview
);

// GET  /api/v1/mentor-reviews/:roadmapId — get reviews for a roadmap
router.get(
  '/:roadmapId',
  requireAuth,
  validateParams(roadmapParamsSchema),
  mentorReviewController.getReviewsByRoadmap
);

// PATCH /api/v1/mentor-reviews/:id — mentor updates status/comment
router.patch(
  '/:id',
  requireAuth,
  authorizeRoles(ROLES.MENTOR),
  validateParams(reviewParamsSchema),
  validateBody(updateReviewSchema),
  mentorReviewController.updateReview
);

module.exports = router;
