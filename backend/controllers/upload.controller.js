const fs = require('fs/promises');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { failure, success } = require('../utils/response');

async function uploadProfileImage(req, res, next) {
  const filePath = req.file?.path;

  if (!filePath) {
    return failure(res, 400, 'VALIDATION_ERROR', 'An image file is required.');
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'profile-images',
      resource_type: 'image',
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('name email role createdAt profileImage');

    if (!user) {
      return failure(res, 404, 'USER_NOT_FOUND', 'User not found.');
    }

    return success(res, {
      profileImage: user.profileImage,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profileImage: user.profileImage || '',
      },
    });
  } catch (error) {
    return next(error);
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
  }
}

module.exports = { uploadProfileImage };