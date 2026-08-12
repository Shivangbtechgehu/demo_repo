const Profile = require('./profile.model');

const PROFILE_SELECT = 'userId fullName education bio currentSkills interests targetRole createdAt updatedAt';

async function createProfile(profileData) {
  return Profile.create(profileData);
}

async function findProfileByUserId(userId) {
  return Profile.findOne({ userId }).select(PROFILE_SELECT);
}

async function updateProfileByUserId(userId, updateData) {
  return Profile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).select(PROFILE_SELECT);
}

module.exports = {
  createProfile,
  findProfileByUserId,
  updateProfileByUserId,
  PROFILE_SELECT,
};
