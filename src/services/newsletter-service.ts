import { NewsletterSubscriberModel } from '../models/newsletter-subscriber-model';
import { sendSubscriptionConfirmation, sendUnsubscribeConfirmation, sendNewBlogNotification } from '../utils/email';
import { ResponseService } from '../utils/response';
import { EmailQueueService } from './email-queue-service';

export class NewsletterService {
  // Subscribe to newsletter
  static async subscribe(email: string) {
    try {
      // Check if already subscribed
      const existingSubscriber = await NewsletterSubscriberModel.findOne({
        where: { email }
      });

      if (existingSubscriber) {
        if (existingSubscriber.isActive) {
          return {
            success: false,
            message: 'You are already subscribed to our newsletter',
            data: null
          };
        } else {
          // Reactivate subscription
          await existingSubscriber.update({
            isActive: true,
            unsubscribedAt: undefined
          });
          
          // Queue confirmation email
          await EmailQueueService.queueSubscriptionConfirmation(email, {
            subscribedAt: existingSubscriber.subscribedAt
          });
          
          return {
            success: true,
            message: 'Welcome back! Your newsletter subscription has been reactivated',
            data: {
              email,
              subscribedAt: existingSubscriber.subscribedAt
            }
          };
        }
      }

      // Create new subscription
      const newSubscriber = await NewsletterSubscriberModel.create({
        email,
        isActive: true,
        subscribedAt: new Date()
      });

      // Queue confirmation email
      await EmailQueueService.queueSubscriptionConfirmation(email, {
        subscribedAt: newSubscriber.subscribedAt
      });

      return {
        success: true,
        message: 'Successfully subscribed to our newsletter!',
        data: {
          email,
          subscribedAt: newSubscriber.subscribedAt
        }
      };
    } catch (error) {
      console.error('❌ Newsletter subscription error:', error);
      throw error;
    }
  }

  // Unsubscribe from newsletter
  static async unsubscribe(email: string) {
    try {
      const subscriber = await NewsletterSubscriberModel.findOne({
        where: { email }
      });

      if (!subscriber) {
        return {
          success: false,
          message: 'Email not found in our subscriber list',
          data: null
        };
      }

      if (!subscriber.isActive) {
        return {
          success: false,
          message: 'You are already unsubscribed from our newsletter',
          data: null
        };
      }

      // Update subscription status
      await subscriber.update({
        isActive: false,
        unsubscribedAt: new Date()
      });

      // Queue unsubscribe confirmation email
      await EmailQueueService.queueUnsubscribeConfirmation(email);

      return {
        success: true,
        message: 'Successfully unsubscribed from our newsletter',
        data: {
          email,
          unsubscribedAt: subscriber.unsubscribedAt
        }
      };
    } catch (error) {
      console.error('❌ Newsletter unsubscription error:', error);
      throw error;
    }
  }

  // Get all subscribers (admin only)
  static async getAllSubscribers() {
    try {
      const subscribers = await NewsletterSubscriberModel.findAll({
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        message: 'Subscribers retrieved successfully',
        data: subscribers
      };
    } catch (error) {
      console.error('❌ Get subscribers error:', error);
      throw error;
    }
  }

  // Get subscriber count
  static async getSubscriberCount() {
    try {
      const totalCount = await NewsletterSubscriberModel.count();
      const activeCount = await NewsletterSubscriberModel.count({
        where: { isActive: true }
      });

      return {
        success: true,
        message: 'Subscriber count retrieved successfully',
        data: {
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount
        }
      };
    } catch (error) {
      console.error('❌ Get subscriber count error:', error);
      throw error;
    }
  }

  // Queue notification to all active subscribers
  static async notifyAllSubscribers(blogData: any) {
    try {
      await EmailQueueService.queueNewBlogNotification(blogData);
      
      return {
        success: true,
        message: 'Blog notification queued for processing',
        data: {
          blogTitle: blogData.title,
          queuedAt: new Date()
        }
      };
    } catch (error) {
      console.error('❌ Queue notification error:', error);
      throw error;
    }
  }
} 