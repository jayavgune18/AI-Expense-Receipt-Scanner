const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-scanner';
    
    // Add helpful warning for deployment debugging
    if (process.env.NODE_ENV === 'production' && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
      logger.warn('⚠️ WARNING: Running in production but connecting to a local MongoDB (localhost). If deployed to a cloud platform, please set a remote MONGODB_URI environment variable (e.g., MongoDB Atlas).');
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;