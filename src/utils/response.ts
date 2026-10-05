import { Response } from 'express';

interface IResponse<T> {
  res: Response;
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

export const ResponseService = <T>({
  res,
  data,
  message = '',
  status = 200,
  success = true,
}: IResponse<T>) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};
