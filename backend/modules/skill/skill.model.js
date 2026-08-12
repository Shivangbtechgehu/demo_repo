const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    category: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80,
    },
    proficiencyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    mappedGoalIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CareerGoal',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

skillSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Skill', skillSchema);
