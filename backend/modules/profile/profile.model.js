const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    education: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    targetRole: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
module.exports = mongoose.model('UserProfile', profileSchema);
