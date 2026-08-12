const { failure, success } = require('../../utils/response');
const profileService = require('./profile.service');

async function upsertProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return failure(res, 401, 'UNAUTHORIZED', 'Authentication token is required.');
    }

    const profile = await profileService.upsertProfile(req.user.id, req.body);
    return success(res, { profile });
  } catch (error) {
    return next(error);
  }
}

async function getMyProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return failure(res, 401, 'UNAUTHORIZED', 'Authentication token is required.');
    }

    const profile = await profileService.getMyProfile(req.user.id);
    return success(res, { profile });
  } catch (error) {
    return next(error);
  }
}

async function patchMyProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return failure(res, 401, 'UNAUTHORIZED', 'Authentication token is required.');
    }

    const profile = await profileService.patchMyProfile(req.user.id, req.body);
    return success(res, { profile });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  upsertProfile,
  getMyProfile,
  patchMyProfile,
};
