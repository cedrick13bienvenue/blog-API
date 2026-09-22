import { Request, Response, NextFunction } from 'express';
import { blacklistedSessions } from './session-blacklist';
import jwt from 'jsonwebtoken';
import { SECRET_KEY, generateToken } from '../utils/jwt';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (
    typeof req.isAuthenticated === 'function' &&
    req.isAuthenticated() &&
    !blacklistedSessions.has(req.sessionID)
  ) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// JWT Authentication middleware for API requests
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check if user is already authenticated (for OAuth2)
export const checkAlreadyAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      success: true,
      message: 'Already authenticated',
      token
    });
  }
  next();
};

// Middleware to generate token for authenticated user
export const generateTokenForUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    
    // Attach token to request for use in controllers
    (req as any).generatedToken = token;
  }
  next();
}; 