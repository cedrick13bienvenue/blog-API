import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../utils/response';

export const roleChecker = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as any);

    if (!user || !allowedRoles.includes(user.role)) {
      return ResponseService({
        res,
        status: 403,
        success: false,
        message: 'Forbidden: You do not have the required permissions',
      });
    }

    next();
  };
};
