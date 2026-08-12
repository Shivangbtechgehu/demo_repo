const profileRepository = require('./profile.repository');
const auditLog = require('../auditlog/auditlog.service');

function normalizeStringArray(values = []) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0)
    )
  );
}

function serializeProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    fullName: profile.fullName,
    education: profile.education,
    bio: profile.bio,
    currentSkills: profile.currentSkills || [],
    interests: profile.interests || [],
    targetRole: profile.targetRole || '',
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

async function upsertProfile(userId, payload) {
  const existingProfile = await profileRepository.findProfileByUserId(userId);
  const updateData = {
    fullName: String(payload.fullName).trim(),
    education: String(payload.education).trim(),
    bio: String(payload.bio).trim(),
    currentSkills: normalizeStringArray(payload.currentSkills || []),
    interests: normalizeStringArray(payload.interests || []),
    targetRole: String(payload.targetRole || '').trim(),
  };

  const profile = existingProfile
    ? await profileRepository.updateProfileByUserId(userId, updateData)
    : await profileRepository.createProfile({ userId, ...updateData });

  // Audit
  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: existingProfile ? auditLog.ACTIONS.PROFILE_UPDATED : auditLog.ACTIONS.PROFILE_CREATED,
    resourceType: 'Profile',
    resourceId: userId,
  });

  return serializeProfile(profile);
}

async function getMyProfile(userId) {
  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    const error = new Error('Profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  return serializeProfile(profile);
}

async function patchMyProfile(userId, payload) {
  const existingProfile = await profileRepository.findProfileByUserId(userId);

  if (!existingProfile) {
    const error = new Error('Profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  const updateData = {};

  if (payload.fullName !== undefined) {
    updateData.fullName = String(payload.fullName).trim();
  }

  if (payload.education !== undefined) {
    updateData.education = String(payload.education).trim();
  }

  if (payload.bio !== undefined) {
    updateData.bio = String(payload.bio).trim();
  }

  if (payload.currentSkills !== undefined) {
    updateData.currentSkills = normalizeStringArray(payload.currentSkills);
  }

  if (payload.interests !== undefined) {
    updateData.interests = normalizeStringArray(payload.interests);
  }

  if (payload.targetRole !== undefined) {
    updateData.targetRole = String(payload.targetRole).trim();
  }

  const profile = await profileRepository.updateProfileByUserId(userId, updateData);

  // Audit
  auditLog.log({
    actorId: userId,
    actorRole: 'student',
    action: auditLog.ACTIONS.PROFILE_UPDATED,
    resourceType: 'Profile',
    resourceId: userId,
  });

  return serializeProfile(profile);
}

module.exports = {
  upsertProfile,
  getMyProfile,
  patchMyProfile,
  serializeProfile,
};
