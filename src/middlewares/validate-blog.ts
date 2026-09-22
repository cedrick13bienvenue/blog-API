import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { ResponseService } from '../utils/response';

interface ValidateOptions<T> {
  type: 'body' | 'params';
  schema: ObjectSchema<T>;
}

export const ValidationMiddleware = <T>({
  type,
  schema,
}: ValidateOptions<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[type]);
    if (error) {
      return ResponseService({
        res,
        data: error.details,
        status: 400,
        success: false,
        message: 'Validation error',
      });
    }
    next();
  };
};
