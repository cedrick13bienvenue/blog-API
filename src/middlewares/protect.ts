import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/user-model';
import { ResponseService } from '../utils/response';
import { SECRET_KEY } from '../utils/jwt';

interface jwtExtendedPayload extends JwtPayload {
    _id: string;
    email: string;
    role: string
}

export interface IRequestUser extends Request {
    user?: jwtExtendedPayload
}

export const protect = (req: IRequestUser, res: Response, next: NextFunction) => {
  try {
    // const authHeader = req.headers.authorization;
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) {
        return ResponseService({
            res,
            status: 401,
            success: false,
            message: "Token not found"
        })
    }
    
    const user = jwt.verify(token as string, SECRET_KEY) as jwtExtendedPayload;

    //const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      return ResponseService({
        data: null,
        res,
        status: 404,
        success: false,
        message: 'User not found',
      });
    }

    req.user = { ...user, id: user._id, _id: user._id };

    next();
  } catch (error) {
    const {message, stack } = error as Error;
    console.log("error ================", error);
    ResponseService({
      data: {message, stack},
      res,
      status: 500,
      success: false
    });
  }
};
