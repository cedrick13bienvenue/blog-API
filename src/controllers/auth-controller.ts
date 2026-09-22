import { Request, Response } from 'express';
import { UserModel, UserAttributes } from '../models/user-model';
import { hashPassword } from '../utils/password';
import { ResponseService } from '../utils/response';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { blacklistedSessions } from '../middlewares/session-blacklist';

export const registerUser = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

// Google OAuth2 callback handler
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
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
  } catch (error) {
    return ResponseService({
      res,
      message: 'Google authentication failed',
      status: 500,
      success: false
    });
  }
};

// Check authentication status
export const checkAuthStatus = async (req: Request, res: Response) => {
  try {
    if (req.isAuthenticated()) {
      const user = req.user as any;
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
  } catch (error) {
    return ResponseService({
      res,
      message: 'Authentication status check failed',
      status: 500,
      success: false
    });
  }
};

// Handle already authenticated user (for OAuth2 callback)
export const handleAlreadyAuthenticated = async (req: Request, res: Response) => {
  try {
    if (req.isAuthenticated()) {
      const user = req.user as any;
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
  } catch (error) {
    return ResponseService({
      res,
      message: 'Authentication check failed',
      status: 500,
      success: false
    });
  }
};

// Get user profile (JWT protected)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return ResponseService({
        res,
        status: 401,
        success: false,
        message: 'Unauthorized',
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
  } catch (error) {
    return ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

// Handle OAuth2 failure
export const handleOAuth2Failure = async (req: Request, res: Response) => {
  return ResponseService({
    res,
    status: 400,
    success: false,
    message: 'Google OAuth2 authentication failed. Please try again.'
  });
};

// Handle logout with session blacklisting
export const handleLogout = async (req: Request, res: Response) => {
  try {
    if (req.session) {
      blacklistedSessions.add(req.sessionID);
      req.logout(() => {
        req.session?.destroy(() => {
          return ResponseService({
            res,
            message: 'Successfully logged out'
          });
        });
      });
    } else {
      return ResponseService({
        res,
        message: 'No session to logout'
      });
    }
  } catch (error) {
    return ResponseService({
      res,
      status: 500,
      success: false,
      message: 'Logout failed'
    });
  }
};