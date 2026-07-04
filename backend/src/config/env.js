const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory only in development
if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  if (result.error) {
    console.warn('⚠️  No .env file found, using environment variables');
  }
}

const requiredInProduction = (key, value) => {
  if (process.env.NODE_ENV === 'production') {
    if (!value || value === 'your-jwt-secret' || value === 'your-refresh-secret' || value === 'your-cloud-name' || value === 'your-api-key' || value === 'your-api-secret') {
      throw new Error(`MISSING CONFIG: The environment variable ${key} is required in production and must not be a default value.`);
    }
  }
  return value;
};

const optional = (value, defaultValue) => value || defaultValue;

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI, // No fallback — db.js handles missing URI with a clear error
  jwtSecret: requiredInProduction('JWT_SECRET', process.env.JWT_SECRET),
  jwtRefreshSecret: requiredInProduction('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: requiredInProduction('CLOUDINARY_CLOUD_NAME', process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: requiredInProduction('CLOUDINARY_API_KEY', process.env.CLOUDINARY_API_KEY),
    apiSecret: requiredInProduction('CLOUDINARY_API_SECRET', process.env.CLOUDINARY_API_SECRET),
  },
  openai: {
    apiKey: requiredInProduction('OPENAI_API_KEY', process.env.OPENAI_API_KEY),
  },
  smtp: {
    host: optional(process.env.SMTP_HOST, 'smtp.gmail.com'),
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: optional(process.env.EMAIL_FROM, 'noreply@expensescanner.com'),
  },
  frontendUrl: optional(process.env.FRONTEND_URL, 'http://localhost:5173'),
  backendUrl: optional(process.env.BACKEND_URL, 'http://localhost:5000'),
};
