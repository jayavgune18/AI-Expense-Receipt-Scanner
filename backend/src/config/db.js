const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (retryCount = 0) => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      logger.error('❌ MONGODB_URI environment variable is not set. Please set it in your Render dashboard or .env file.');
      logger.error('   For MongoDB Atlas, use: mongodb+srv://<user>:<pass>@cluster.mongodb.net/expense-scanner');
      logger.error('   For local development, use: mongodb://127.0.0.1:27017/expense-scanner');
      
      if (process.env.NODE_ENV === 'production') {
        logger.error('   ⚠️ A remote MongoDB URI (e.g., MongoDB Atlas) is REQUIRED in production.');
        process.exit(1);
      }
      
      // In development, try localhost as fallback
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/expense-scanner';
      return connectDB(retryCount);
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);
    
    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }
    
    logger.error('❌ All MongoDB connection attempts failed. Exiting...');
    process.exit(1);
  }
};

module.exports = connectDB;
