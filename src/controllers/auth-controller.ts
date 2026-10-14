import { Request, Response } from 'express';
import { UserModel, UserAttributes } from '../models/user-model';
import { hashPassword } from '../utils/password';
import { ResponseService } from '../utils/response';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { blacklistedSessions } from '../middlewares/session-blacklist';
import { IRequestUser } from '../middlewares/protect';
import { asyncHandler } from '../utils/async-handler';

// Google OAuth / session-based routes attach a full UserModel instance to req.user via Passport
type SessionUser = UserModel;

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, gender, role } = req.body;

  // Check if email already exists
  const existingUser = await UserModel.findOne({ where: { email } });
  if (existingUser) {
    return ResponseService({
      res,
      status: 400,
      success: false,
      message: 'Email already in use',
    });
  }

  const hashed = await hashPassword(password);

  const newUser = await UserModel.create({
    name,
    email,
    password: hashed,
    gender,
    role: role || 'user', // Use provided role or default to 'user'
    isActive: true,
  });

  ResponseService({
    res,
    status: 201,
    message: 'User registered successfully',
    data: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ where: { email } });
  if (!user) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      message: 'Invalid email or password',
    });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      message: 'Invalid email or password',
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  ResponseService({
    res,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

// Google OAuth2 callback handler
export const handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as SessionUser | undefined;
  if (!user) {
    return ResponseService({
      res,
      message: 'User not found after Google login',
      status: 401,
      success: false
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return ResponseService({
    res,
    data: {
      message: 'Google login successful',
      token
    }
  });
});

// Check authentication status
export const checkAuthStatus = asyncHandler(async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const user = req.user as SessionUser;
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return ResponseService({
      res,
      data: {
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  }

  return ResponseService({
    res,
    data: {
      authenticated: false,
      message: 'Not authenticated'
    }
  });
});

// Handle already authenticated user (for OAuth2 callback)
export const handleAlreadyAuthenticated = asyncHandler(async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const user = req.user as SessionUser;
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return ResponseService({
      res,
      data: {
        message: 'Already authenticated',
        token
      }
    });
  }
  // Continue to next middleware if not authenticated
  return null;
});

// Get user profile (JWT protected)
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const authUser = req.user as IRequestUser['user'];
  if (!authUser) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      message: 'Unauthorized',
    });
  }

  const user = await UserModel.findByPk(authUser.id);
  if (!user) {
    return ResponseService({
      res,
      status: 404,
      success: false,
      message: 'User not found',
    });
  }

  return ResponseService({
    res,
    message: 'Profile retrieved successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
    },
  });
});

// Handle OAuth2 failure
export const handleOAuth2Failure = asyncHandler(async (req: Request, res: Response) => {
  return ResponseService({
    res,
    status: 400,
    success: false,
    message: 'Google OAuth2 authentication failed. Please try again.'
  });
});

// Handle logout with session blacklisting
export const handleLogout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session) {
    return ResponseService({
      res,
      message: 'No session to logout'
    });
  }

  blacklistedSessions.add(req.sessionID);
  return new Promise<void>((resolve) => {
    req.logout(() => {
      req.session?.destroy(() => {
        ResponseService({
          res,
          message: 'Successfully logged out'
        });
        resolve();
      });
    });
  });
});
