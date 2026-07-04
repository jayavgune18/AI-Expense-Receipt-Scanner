const path = require('path');

// Load .env with explicit path so it works regardless of CWD (only in development)
if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: path.resolve(__dirname, '.env') });
  if (result.error) {
    console.warn('⚠️  No .env file found, using environment variables');
  }
}

const app = require('./src/app');
const connectDB = require('./src/config/db');
const Category = require('./src/models/Category');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Log startup info
    logger.info(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
    logger.info(`MONGODB_URI is ${process.env.MONGODB_URI ? 'set' : 'NOT SET - will use fallback'}`);

    // Connect to MongoDB
    await connectDB();
    logger.info('Database connected successfully');

    // Seed default categories
    await Category.seedDefaults();
    logger.info('Default categories seeded');

    // Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();