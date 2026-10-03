import { QUEUES, EMAIL_JOB_TYPES, queueUtils, EmailJob } from '../config/redis';
import { NewsletterSubscriberModel } from '../models/newsletter-subscriber-model';

export class EmailQueueService {
  // Add new blog notification to queue
  static async queueNewBlogNotification(blogData: any): Promise<void> {
    try {
      // Get all active subscribers
      const subscribers = await NewsletterSubscriberModel.findAll({
        where: { isActive: true },
        attributes: ['email']
      });

      if (subscribers.length === 0) {
        console.log('📧 No active subscribers to notify');
        return;
      }

      const emailJob: EmailJob = {
        type: EMAIL_JOB_TYPES.NEW_BLOG_NOTIFICATION,
        data: blogData,
        subscribers: subscribers.map(sub => sub.email),
        timestamp: new Date(),
      };

      await queueUtils.addToQueue(QUEUES.EMAIL_QUEUE, emailJob);
      console.log(`📧 New blog notification queued for ${subscribers.length} subscribers`);
    } catch (error) {
      console.error('❌ Error queuing new blog notification:', error);
      throw error;
    }
  }

  // Add subscription confirmation to queue
  static async queueSubscriptionConfirmation(email: string, subscriberData: any): Promise<void> {
    try {
      const emailJob: EmailJob = {
        type: EMAIL_JOB_TYPES.SUBSCRIPTION_CONFIRMATION,
        data: subscriberData,
        subscribers: [email],
        timestamp: new Date(),
      };

      await queueUtils.addToQueue(QUEUES.EMAIL_QUEUE, emailJob);
      console.log(`📧 Subscription confirmation queued for: ${email}`);
    } catch (error) {
      console.error('❌ Error queuing subscription confirmation:', error);
      throw error;
    }
  }

  // Add unsubscribe confirmation to queue
  static async queueUnsubscribeConfirmation(email: string): Promise<void> {
    try {
      const emailJob: EmailJob = {
        type: EMAIL_JOB_TYPES.UNSUBSCRIBE_CONFIRMATION,
        data: {},
        subscribers: [email],
        timestamp: new Date(),
      };

      await queueUtils.addToQueue(QUEUES.EMAIL_QUEUE, emailJob);
      console.log(`📧 Unsubscribe confirmation queued for: ${email}`);
    } catch (error) {
      console.error('❌ Error queuing unsubscribe confirmation:', error);
      throw error;
    }
  }

  // Get queue statistics
  static async getQueueStats(): Promise<{
    mainQueue: number;
    retryQueue: number;
    deadLetterQueue: number;
    totalJobs: number;
  }> {
    try {
      const [mainQueue, retryQueue, deadLetterQueue] = await Promise.all([
        queueUtils.getQueueLength(QUEUES.EMAIL_QUEUE),
        queueUtils.getQueueLength(QUEUES.EMAIL_RETRY_QUEUE),
        queueUtils.getQueueLength(QUEUES.EMAIL_DEAD_LETTER_QUEUE),
      ]);

      return {
        mainQueue,
        retryQueue,
        deadLetterQueue,
        totalJobs: mainQueue + retryQueue + deadLetterQueue,
      };
    } catch (error) {
      console.error('❌ Error getting queue stats:', error);
      throw error;
    }
  }

  // Clear all queues (for testing/debugging)
  static async clearAllQueues(): Promise<void> {
    try {
      await Promise.all([
        queueUtils.clearQueue(QUEUES.EMAIL_QUEUE),
        queueUtils.clearQueue(QUEUES.EMAIL_RETRY_QUEUE),
        queueUtils.clearQueue(QUEUES.EMAIL_DEAD_LETTER_QUEUE),
      ]);
      console.log('🧹 All email queues cleared');
    } catch (error) {
      console.error('❌ Error clearing queues:', error);
      throw error;
    }
  }

  // Get dead letter queue jobs (for manual processing)
  static async getDeadLetterJobs(): Promise<EmailJob[]> {
    try {
      const jobs: EmailJob[] = [];
      let job;
      
      // Get all jobs from dead letter queue
      while (true) {
        job = await queueUtils.getFromQueue(QUEUES.EMAIL_DEAD_LETTER_QUEUE);
        if (!job) break;
        jobs.push(job);
      }

      return jobs;
    } catch (error) {
      console.error('❌ Error getting dead letter jobs:', error);
      throw error;
    }
  }

  // Reprocess dead letter queue (for manual recovery)
  static async reprocessDeadLetterQueue(): Promise<void> {
    try {
      const deadJobs = await this.getDeadLetterJobs();
      
      for (const job of deadJobs) {
        // Reset retry count and move back to main queue
        job.retryCount = 0;
        await queueUtils.addToQueue(QUEUES.EMAIL_QUEUE, job);
        console.log(`🔄 Reprocessing dead letter job: ${job.type}`);
      }

      console.log(`🔄 Reprocessed ${deadJobs.length} dead letter jobs`);
    } catch (error) {
      console.error('❌ Error reprocessing dead letter queue:', error);
      throw error;
    }
  }
} 