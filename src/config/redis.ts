import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Create Redis client
export const redisClient = new Redis(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('🔴 Redis connected successfully');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redisClient.on('close', () => {
  logger.info('🔴 Redis connection closed');
});

// Queue names
export const QUEUES = {
  EMAIL_QUEUE: 'email_queue',
  EMAIL_RETRY_QUEUE: 'email_retry_queue',
  EMAIL_DEAD_LETTER_QUEUE: 'email_dead_letter_queue',
} as const;

// Email job types
export const EMAIL_JOB_TYPES = {
  NEW_BLOG_NOTIFICATION: 'NEW_BLOG_NOTIFICATION',
  SUBSCRIPTION_CONFIRMATION: 'SUBSCRIPTION_CONFIRMATION',
  UNSUBSCRIBE_CONFIRMATION: 'UNSUBSCRIBE_CONFIRMATION',
} as const;

// Email job interface
export interface EmailJob {
  type: keyof typeof EMAIL_JOB_TYPES;
  data: any;
  subscribers: string[];
  timestamp: Date;
  retryCount?: number;
}

// Queue utility functions
export const queueUtils = {
  // Add job to queue
  async addToQueue(queueName: string, job: EmailJob): Promise<void> {
    try {
      await redisClient.lpush(queueName, JSON.stringify(job));
      logger.info(`📧 Job added to queue: ${queueName}`);
    } catch (error) {
      logger.error('❌ Error adding job to queue:', error);
      throw error;
    }
  },

  // Get job from queue
  async getFromQueue(queueName: string): Promise<EmailJob | null> {
    try {
      const result = await redisClient.brpop(queueName, 0);
      if (result && result[1]) {
        return JSON.parse(result[1]);
      }
      return null;
    } catch (error) {
      logger.error('❌ Error getting job from queue:', error);
      throw error;
    }
  },

  // Move job to retry queue
  async moveToRetryQueue(job: EmailJob, maxRetries: number = 3): Promise<void> {
    if ((job.retryCount || 0) < maxRetries) {
      job.retryCount = (job.retryCount || 0) + 1;
      await this.addToQueue(QUEUES.EMAIL_RETRY_QUEUE, job);
      logger.info(`🔄 Job moved to retry queue (attempt ${job.retryCount}/${maxRetries})`);
    } else {
      await this.addToQueue(QUEUES.EMAIL_DEAD_LETTER_QUEUE, job);
      logger.warn(`💀 Job moved to dead letter queue after ${maxRetries} retries`);
    }
  },

  // Get queue length
  async getQueueLength(queueName: string): Promise<number> {
    try {
      return await redisClient.llen(queueName);
    } catch (error) {
      console.error('❌ Error getting queue length:', error);
      return 0;
    }
  },

  // Clear queue
  async clearQueue(queueName: string): Promise<void> {
    try {
      await redisClient.del(queueName);
      logger.info(`🧹 Queue cleared: ${queueName}`);
    } catch (error) {
      logger.error('❌ Error clearing queue:', error);
      throw error;
    }
  },
};

export default redisClient; 