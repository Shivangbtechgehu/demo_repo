const MentorReview = require('./mentorreview.model');

const REVIEW_SELECT = 'roadmapId studentId mentorId comment status createdAt updatedAt';

async function createReview(data) {
  return MentorReview.create(data);
}

async function findReviewsByRoadmapId(roadmapId) {
  return MentorReview.find({ roadmapId })
    .sort({ createdAt: -1 })
    .select(REVIEW_SELECT)
    .populate('mentorId', 'name email profileImage')
    .populate('studentId', 'name email');
}

async function findReviewById(id) {
  return MentorReview.findById(id)
    .select(REVIEW_SELECT)
    .populate('mentorId', 'name email profileImage')
    .populate('studentId', 'name email');
}

async function findAllReviews(filters = {}) {
  const query = {};
  if (filters.status)    query.status    = filters.status;
  if (filters.mentorId)  query.mentorId  = filters.mentorId;
  if (filters.studentId) query.studentId = filters.studentId;

  return MentorReview.find(query)
    .sort({ createdAt: -1 })
    .select(REVIEW_SELECT)
    .populate('mentorId', 'name email')
    .populate('studentId', 'name email');
}

async function updateReviewById(id, updateData) {
  return MentorReview.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .select(REVIEW_SELECT)
    .populate('mentorId', 'name email profileImage')
    .populate('studentId', 'name email');
}

// All roadmaps that have at least one review from a mentor
async function findRoadmapIdsByMentorId(mentorId) {
  const reviews = await MentorReview.find({ mentorId }).distinct('roadmapId');
  return reviews;
}

module.exports = {
  createReview,
  findReviewsByRoadmapId,
  findReviewById,
  findAllReviews,
  updateReviewById,
  findRoadmapIdsByMentorId,
  REVIEW_SELECT,
};
