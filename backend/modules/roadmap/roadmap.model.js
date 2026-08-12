const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    estimatedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    resources: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const roadmapSchema = new mongoose.Schema(
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
    roadmapTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    estimatedDuration: {
      type: String,
      default: '',
      trim: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    sourceMatchedSkills: {
      type: [String],
      default: [],
    },
    sourceMissingSkills: {
      type: [String],
      default: [],
    },
    steps: {
      type: [roadmapStepSchema],
      default: [],
    },
    totalEstimatedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

roadmapSchema.index({ userId: 1, goalId: 1 }, { unique: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
