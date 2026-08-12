const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // e.g. USER_REGISTERED, GOAL_CREATED, SKILL_DELETED, ROADMAP_GENERATED ...
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
      index: true,
      // e.g. User, Profile, CareerGoal, Skill, GapAnalysis, Roadmap, Progress
    },
    resourceId: {
      type: String,
      default: null,
      // string so it works for any resource id shape
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // safe extra info — never store passwords or OTPs here
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
    // No updatedAt — audit logs are immutable
    timestamps: false,
  }
);

// Compound indexes for the most common admin queries
auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
