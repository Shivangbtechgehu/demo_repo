const mentorReviewRepository = require('./mentorreview.repository');
const roadmapRepository = require('../roadmap/roadmap.repository');
const { notify } = require('../notification/notification.service');
const auditLog = require('../auditlog/auditlog.service');

function createAppError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function serializeReview(review) {
  if (!review) return null;

  const mentor  = review.mentorId;
  const student = review.studentId;

  return {
    id:         review._id.toString(),
    roadmapId:  review.roadmapId.toString(),
    studentId:  typeof student === 'object' ? student._id.toString() : review.studentId.toString(),
    student:    typeof student === 'object' ? { id: student._id.toString(), name: student.name, email: student.email } : null,
    mentorId:   typeof mentor  === 'object' ? mentor._id.toString()  : review.mentorId.toString(),
    mentor:     typeof mentor  === 'object' ? { id: mentor._id.toString(), name: mentor.name, email: mentor.email, profileImage: mentor.profileImage || '' } : null,
    comment:    review.comment,
    status:     review.status,
    createdAt:  review.createdAt,
    updatedAt:  review.updatedAt,
  };
}

// ─── Mentor: create a review ─────────────────────────────────────────────────

async function createReview(mentorId, mentorRole, payload) {
  const { roadmapId, studentId, comment } = payload;

  // Verify the roadmap exists
  const roadmap = await roadmapRepository.findRoadmapByIdAndUserId(roadmapId, studentId);
  if (!roadmap) {
    throw createAppError('Roadmap not found for the given student.', 404, 'ROADMAP_NOT_FOUND');
  }

  const review = await mentorReviewRepository.createReview({
    roadmapId,
    studentId,
    mentorId,
    comment: String(comment).trim(),
    status: 'pending',
  });

  // Audit
  auditLog.log({
    actorId:      mentorId,
    actorRole:    mentorRole,
    action:       'MENTOR_REVIEW_CREATED',
    resourceType: 'MentorReview',
    resourceId:   review._id.toString(),
    metadata:     { roadmapId, studentId },
  });

  // Notify the student
  notify({
    userId:  studentId,
    title:   '💬 Mentor review submitted',
    message: 'A mentor has submitted a review on your roadmap. Check it out!',
    type:    'mentor',
  });

  return serializeReview(review);
}

// ─── Student / anyone: get reviews for a roadmap ─────────────────────────────

async function getReviewsByRoadmap(roadmapId) {
  const reviews = await mentorReviewRepository.findReviewsByRoadmapId(roadmapId);
  return reviews.map(serializeReview);
}

// ─── Mentor: update status / edit comment ────────────────────────────────────

async function updateReview(mentorId, mentorRole, reviewId, payload) {
  const review = await mentorReviewRepository.findReviewById(reviewId);

  if (!review) {
    throw createAppError('Review not found.', 404, 'REVIEW_NOT_FOUND');
  }

  // Only the mentor who created the review can update it
  if (review.mentorId._id.toString() !== mentorId.toString()) {
    throw createAppError('You can only update your own reviews.', 403, 'FORBIDDEN');
  }

  const updateData = {};
  if (payload.comment !== undefined) updateData.comment = String(payload.comment).trim();
  if (payload.status  !== undefined) updateData.status  = payload.status;

  const updated = await mentorReviewRepository.updateReviewById(reviewId, updateData);

  // Audit
  auditLog.log({
    actorId:      mentorId,
    actorRole:    mentorRole,
    action:       'MENTOR_REVIEW_UPDATED',
    resourceType: 'MentorReview',
    resourceId:   reviewId,
    metadata:     { status: payload.status },
  });

  // Notify student when status changes to approved or rejected
  if (payload.status === 'approved' || payload.status === 'rejected') {
    const studentId = updated.studentId._id
      ? updated.studentId._id.toString()
      : updated.studentId.toString();

    notify({
      userId:  studentId,
      title:   payload.status === 'approved' ? '✅ Roadmap approved!' : '❌ Roadmap needs changes',
      message: payload.status === 'approved'
        ? 'Your mentor has approved your roadmap. Keep going!'
        : 'Your mentor has requested changes to your roadmap. Check the review.',
      type: 'mentor',
    });
  }

  return serializeReview(updated);
}

// ─── Admin: get all reviews ───────────────────────────────────────────────────

async function getAllReviews(filters) {
  const reviews = await mentorReviewRepository.findAllReviews(filters);
  return reviews.map(serializeReview);
}

// ─── Mentor dashboard: roadmaps they have reviewed ───────────────────────────

async function getMentorDashboard(mentorId) {
  const reviews = await mentorReviewRepository.findAllReviews({ mentorId });
  return reviews.map(serializeReview);
}

module.exports = {
  createReview,
  getReviewsByRoadmap,
  updateReview,
  getAllReviews,
  getMentorDashboard,
};
