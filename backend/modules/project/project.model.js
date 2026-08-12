const mongoose = require('mongoose');

// ── Embedded task sub-document ───────────────────────────────────────────────
const projectTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
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
    timestamps: false,
    // tasks DO get their own _id so we can reference them in PATCH/DELETE
  }
);

// ── Project document ─────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerGoal',
      default: null,
    },
    // Optional: which roadmap step order this project maps to
    linkedStepOrder: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'on_hold'],
      default: 'planned',
      index: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tasks: {
      type: [projectTaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

projectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
