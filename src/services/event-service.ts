import { EventEmitter } from 'events';
import { NewsletterSubscriberModel } from '../models/newsletter-subscriber-model';
import { EmailQueueService } from './email-queue-service';

// Create event emitter instance
export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  BLOG_CREATED: 'blog:created',
  BLOG_UPDATED: 'blog:updated',
  BLOG_DELETED: 'blog:deleted',
} as const;

// Blog creation event handler
export const handleBlogCreated = async (blogData: any) => {
  try {
    console.log('📧 Blog created event triggered:', blogData.title);
    
    // Queue notification for all active subscribers
    await EmailQueueService.queueNewBlogNotification(blogData);
    
    console.log(`📧 Blog notification queued for processing`);
    
    return {
      success: true,
      message: 'Blog notification queued successfully',
      blogTitle: blogData.title,
      queuedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Error handling blog created event:', error);
    throw error;
  }
};

// Blog updated event handler
export const handleBlogUpdated = async (blogData: any) => {
  console.log('📝 Blog updated event triggered:', blogData.title);
  // Future implementation for blog update notifications
};

// Blog deleted event handler
export const handleBlogDeleted = async (blogData: any) => {
  console.log('🗑️ Blog deleted event triggered:', blogData.title);
  // Future implementation for blog deletion notifications
};

// Register event handlers
export const registerEventHandlers = () => {
  eventEmitter.on(EVENTS.BLOG_CREATED, handleBlogCreated);
  eventEmitter.on(EVENTS.BLOG_UPDATED, handleBlogUpdated);
  eventEmitter.on(EVENTS.BLOG_DELETED, handleBlogDeleted);
  
  console.log('🎯 Event handlers registered successfully');
};

// Trigger blog created event
export const triggerBlogCreated = (blogData: any) => {
  eventEmitter.emit(EVENTS.BLOG_CREATED, blogData);
};

// Trigger blog updated event
export const triggerBlogUpdated = (blogData: any) => {
  eventEmitter.emit(EVENTS.BLOG_UPDATED, blogData);
};

// Trigger blog deleted event
export const triggerBlogDeleted = (blogData: any) => {
  eventEmitter.emit(EVENTS.BLOG_DELETED, blogData);
}; 