const mongoose = require('mongoose');

const gapAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerGoal',
      required: true,
      index: true,
    },
    goalTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    completionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

gapAnalysisSchema.index({ userId: 1, goalId: 1 }, { unique: true });

module.exports = mongoose.model('GapAnalysis', gapAnalysisSchema);
