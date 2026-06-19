const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredInProduction = (key, value) => {
  if (process.env.NODE_ENV === 'production') {
    if (!value || value === 'your-jwt-secret' || value === 'your-refresh-secret') {
      throw new Error(`MISSING CONFIG: The environment variable ${key} is required in production and must not be a default value.`);
    }
  }
  return value;
};

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: requiredInProduction('JWT_SECRET', process.env.JWT_SECRET),
  jwtRefreshSecret: requiredInProduction('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@expensescanner.com',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
};