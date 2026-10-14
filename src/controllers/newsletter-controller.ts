import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletter-service';
import { ResponseService } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';

// Subscribe to newsletter
export const subscribeToNewsletter = asyncHandler(async (req: Request, res: Response) => {
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
});

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = asyncHandler(async (req: Request, res: Response) => {
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
});

// Get all subscribers (admin only)
export const getAllSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const result = await NewsletterService.getAllSubscribers();
  return ResponseService({
    res,
    message: result.message,
    data: result.data,
  });
});

// Get subscriber count
export const getSubscriberCount = asyncHandler(async (req: Request, res: Response) => {
  const result = await NewsletterService.getSubscriberCount();
  return ResponseService({
    res,
    message: result.message,
    data: result.data,
  });
});
