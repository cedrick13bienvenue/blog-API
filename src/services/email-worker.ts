import { redisClient, QUEUES, EMAIL_JOB_TYPES, queueUtils, EmailJob } from '../config/redis';
import { sendNewBlogNotification, sendSubscriptionConfirmation, sendUnsubscribeConfirmation } from '../utils/email';
import { NewsletterSubscriberModel } from '../models/newsletter-subscriber-model';
import logger, { logEmailQueue } from '../config/logger';

export class EmailWorker {
  private isRunning: boolean = false;
  private workerId: string;

  constructor(workerId?: string) {
    this.workerId = workerId || `worker-${Date.now()}`;
  }

  // Start the email worker
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⚠️ Email worker is already running');
      return;
    }

    this.isRunning = true;
    logEmailQueue(`Starting email worker: ${this.workerId}`);

    try {
      // Process main email queue
      await this.processMainQueue();
    } catch (error) {
      logger.error('❌ Email worker error:', error);
      this.isRunning = false;
      throw error;
    }
  }

  // Stop the email worker
  stop(): void {
    this.isRunning = false;
    logEmailQueue(`Stopping email worker: ${this.workerId}`);
  }

  // Process main email queue
  private async processMainQueue(): Promise<void> {
    logEmailQueue(`Worker ${this.workerId} listening for email jobs...`);

    while (this.isRunning) {
      try {
        // Get job from queue (blocking)
        const job = await queueUtils.getFromQueue(QUEUES.EMAIL_QUEUE);
        
        if (job) {
          logEmailQueue(`Processing job: ${job.type} (${job.subscribers.length} subscribers)`);
          await this.processEmailJob(job);
        }
      } catch (error) {
        logger.error('❌ Error processing email job:', error);
        // Continue processing other jobs
      }
    }
  }

  // Process individual email job
  private async processEmailJob(job: EmailJob): Promise<void> {
    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    try {
      switch (job.type) {
        case EMAIL_JOB_TYPES.NEW_BLOG_NOTIFICATION:
          await this.processNewBlogNotification(job, successCount, failureCount);
          break;
        case EMAIL_JOB_TYPES.SUBSCRIPTION_CONFIRMATION:
          await this.processSubscriptionConfirmation(job, successCount, failureCount);
          break;
        case EMAIL_JOB_TYPES.UNSUBSCRIBE_CONFIRMATION:
          await this.processUnsubscribeConfirmation(job, successCount, failureCount);
          break;
        default:
          console.warn(`⚠️ Unknown job type: ${job.type}`);
      }

      const duration = Date.now() - startTime;
      logEmailQueue(`Job completed: ${job.type} - ${successCount} success, ${failureCount} failed (${duration}ms)`);

      // If there were failures, move to retry queue
      if (failureCount > 0) {
        await queueUtils.moveToRetryQueue(job);
      }

    } catch (error) {
      logger.error(`❌ Error processing job ${job.type}:`, error);
      await queueUtils.moveToRetryQueue(job);
    }
  }

  // Process new blog notification
  private async processNewBlogNotification(
    job: EmailJob, 
    successCount: number, 
    failureCount: number
  ): Promise<void> {
    const { data: blogData, subscribers } = job;

    for (const email of subscribers) {
      try {
        await sendNewBlogNotification(email, blogData);
        successCount++;
        logEmailQueue(`Blog notification sent to: ${email}`);
      } catch (error) {
        failureCount++;
        logger.error(`❌ Failed to send blog notification to ${email}:`, error);
      }
    }
  }

  // Process subscription confirmation
  private async processSubscriptionConfirmation(
    job: EmailJob, 
    successCount: number, 
    failureCount: number
  ): Promise<void> {
    const { data: subscriberData, subscribers } = job;

    for (const email of subscribers) {
      try {
        await sendSubscriptionConfirmation(email, subscriberData);
        successCount++;
        logEmailQueue(`Subscription confirmation sent to: ${email}`);
      } catch (error) {
        failureCount++;
        logger.error(`❌ Failed to send subscription confirmation to ${email}:`, error);
      }
    }
  }

  // Process unsubscribe confirmation
  private async processUnsubscribeConfirmation(
    job: EmailJob, 
    successCount: number, 
    failureCount: number
  ): Promise<void> {
    const { subscribers } = job;

    for (const email of subscribers) {
      try {
        await sendUnsubscribeConfirmation(email);
        successCount++;
        logEmailQueue(`Unsubscribe confirmation sent to: ${email}`);
      } catch (error) {
        failureCount++;
        logger.error(`❌ Failed to send unsubscribe confirmation to ${email}:`, error);
      }
    }
  }

  // Process retry queue
  async processRetryQueue(): Promise<void> {
    logEmailQueue(`Processing retry queue...`);
    
    while (this.isRunning) {
      try {
        const job = await queueUtils.getFromQueue(QUEUES.EMAIL_RETRY_QUEUE);
        if (job) {
          logEmailQueue(`Retrying job: ${job.type} (attempt ${job.retryCount})`);
          await this.processEmailJob(job);
        }
      } catch (error) {
        logger.error('❌ Error processing retry queue:', error);
      }
    }
  }

  // Get queue statistics
  async getQueueStats(): Promise<{
    mainQueue: number;
    retryQueue: number;
    deadLetterQueue: number;
  }> {
    const [mainQueue, retryQueue, deadLetterQueue] = await Promise.all([
      queueUtils.getQueueLength(QUEUES.EMAIL_QUEUE),
      queueUtils.getQueueLength(QUEUES.EMAIL_RETRY_QUEUE),
      queueUtils.getQueueLength(QUEUES.EMAIL_DEAD_LETTER_QUEUE),
    ]);

    return {
      mainQueue,
      retryQueue,
      deadLetterQueue,
    };
  }
}

// Create and export default worker instance
export const emailWorker = new EmailWorker();

// Start worker function (for CLI)
export const startEmailWorker = async (): Promise<void> => {
  try {
    await emailWorker.start();
  } catch (error) {
    logger.error('❌ Failed to start email worker:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Received SIGINT, shutting down email worker...');
  emailWorker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Received SIGTERM, shutting down email worker...');
  emailWorker.stop();
  process.exit(0);
}); 