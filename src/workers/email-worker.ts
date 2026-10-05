#!/usr/bin/env node

import { startEmailWorker } from '../services/email-worker';
import { connectDB } from '../config/db';
import { redisClient } from '../config/redis';
import logger from '../config/logger';

logger.info('🚀 Starting Email Worker...');

async function main() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Database connected');

    // Test Redis connection
    await redisClient.ping();
    logger.info('✅ Redis connected');

    // Start email worker
    await startEmailWorker();
  } catch (error) {
    logger.error('❌ Failed to start email worker:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down email worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down email worker...');
  process.exit(0);
});

// Start the worker
main().catch((error) => {
  logger.error('❌ Email worker failed:', error);
  process.exit(1);
}); 