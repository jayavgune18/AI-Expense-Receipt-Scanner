const cloudinary = require('cloudinary').v2;
const env = require('./env');

// Only configure if credentials are provided, otherwise use a mock
if (env.cloudinary.cloudName && env.cloudinary.cloudName !== 'your-cloud-name') {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

module.exports = cloudinary;