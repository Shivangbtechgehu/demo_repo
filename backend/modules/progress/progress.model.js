const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    stepOrder: {
      type: Number,
      required: true,
      min: 1,
    },
    stepTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerGoal',
      required: true,
      index: true,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    totalSteps: {
      type: Number,
      required: true,
      min: 0,
    },
    completedSteps: {
      type: Number,
      default: 0,
      min: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One progress record per user per roadmap
progressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
