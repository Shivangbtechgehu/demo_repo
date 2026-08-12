const User = require('../../models/User');

const USER_SELECT = 'name email role isEmailVerified createdAt profileImage';

async function createUser(userData) {
  return User.create(userData);
}

async function findUserByEmail(email, includePassword = false) {
  const query = User.findOne({ email });

  if (includePassword) {
    query.select('+password');
  }

  return query;
}

// Used when we need OTP fields too (verification flows)
async function findUserByEmailWithOtp(email) {
  return User.findOne({ email }).select('+password +otp +otpExpiresAt');
}

async function findUserById(userId, includePassword = false) {
  const query = User.findById(userId).select(USER_SELECT);

  if (includePassword) {
    query.select('+password');
  }

  return query;
}

async function updateUserById(userId, updateData) {
  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select(USER_SELECT);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailWithOtp,
  findUserById,
  updateUserById,
  USER_SELECT,
};
