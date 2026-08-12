const cloudinary = require('cloudinary').v2;
const { getRequiredEnv } = require('./env');

cloudinary.config({
  cloud_name: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
  api_key: getRequiredEnv('CLOUDINARY_API_KEY'),
  api_secret: getRequiredEnv('CLOUDINARY_API_SECRET'),
});

console.log('Cloudinary configured successfully');

module.exports = cloudinary;