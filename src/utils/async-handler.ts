import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ResponseService } from './response';
import { logError } from '../config/logger';

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async controller so thrown/rejected errors are logged server-side
 * (with stack trace) and the client gets a generic message instead of the
 * raw error text, which can leak internals (query details, file paths, etc).
 */
export const asyncHandler = (handler: AsyncRouteHandler): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, next).catch((error: Error) => {
      logError(`${req.method} ${req.originalUrl} failed: ${error.message}`, {
        stack: error.stack,
      });

      if (res.headersSent) {
        return next(error);
      }

      ResponseService({
        res,
        status: 500,
        success: false,
        message: 'Something went wrong. Please try again later.',
      });
    });
  };
};
