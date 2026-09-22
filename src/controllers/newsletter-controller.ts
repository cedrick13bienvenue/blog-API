import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletter-service';
import { ResponseService } from '../utils/response';

// Subscribe to newsletter
export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ResponseService({
        res,
        status: 400,
        success: false,
        message: 'Email is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ResponseService({
        res,
        status: 400,
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const result = await NewsletterService.subscribe(email);
    
    if (result.success) {
      return ResponseService({
        res,
        message: result.message,
        data: result.data,
      });
    } else {
      return ResponseService({
        res,
        status: 400,
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    return ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to subscribe to newsletter',
    });
  }
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ResponseService({
        res,
        status: 400,
        success: false,
        message: 'Email is required',
      });
    }

    const result = await NewsletterService.unsubscribe(email);
    
    if (result.success) {
      return ResponseService({
        res,
        message: result.message,
        data: result.data,
      });
    } else {
      return ResponseService({
        res,
        status: 400,
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('❌ Newsletter unsubscription error:', error);
    return ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to unsubscribe from newsletter',
    });
  }
};

// Get all subscribers (admin only)
export const getAllSubscribers = async (req: Request, res: Response) => {
  try {
    const result = await NewsletterService.getAllSubscribers();
    return ResponseService({
      res,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Get subscribers error:', error);
    return ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to get subscribers',
    });
  }
};

// Get subscriber count
export const getSubscriberCount = async (req: Request, res: Response) => {
  try {
    const result = await NewsletterService.getSubscriberCount();
    return ResponseService({
      res,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Get subscriber count error:', error);
    return ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Failed to get subscriber count',
    });
  }
}; 