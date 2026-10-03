import { Router } from 'express';
import passport from 'passport';
import { registerUser, loginUser, handleGoogleCallback, checkAuthStatus, handleAlreadyAuthenticated, getUserProfile, handleOAuth2Failure, handleLogout } from '../controllers/auth-controller';
import { ValidationMiddleware } from '../middlewares/validate-blog';
import { blacklistedSessions } from '../middlewares/session-blacklist';
import { authenticateToken, checkAlreadyAuthenticated } from '../middlewares/auth';
import { ResponseService } from '../utils/response';

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and OAuth2 routes
 *
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Start Google OAuth2 login
 *     responses:
 *       302:
 *         description: Redirects to Google login
 *
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth2 callback
 *     responses:
 *       302:
 *         description: Redirects to dashboard after successful login
 *
 * /logout:
 *   get:
 *     tags: [Auth]
 *     summary: Logout and blacklist session
 *     responses:
 *       200:
 *         description: Logged out
 *
 * /register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
authRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Check authentication status
authRouter.get('/auth/status', checkAuthStatus);

// Google OAuth2 callback route
authRouter.get(
  '/auth/google/callback',
  checkAlreadyAuthenticated,
  passport.authenticate('google', { 
    failureRedirect: '/auth/google/failure',
    failureFlash: true 
  }),
  handleGoogleCallback
);

// OAuth2 failure route
authRouter.get('/auth/google/failure', handleOAuth2Failure);

// Logout route with session blacklisting
authRouter.get('/logout', handleLogout);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user and blacklist session/token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRouter.post(
  '/register',
  // ValidationMiddleware({ type: 'body', schema: RegisterUserSchema }),
  registerUser
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
authRouter.post(
  '/login',
  // ValidationMiddleware({ type: 'body', schema: LoginUserSchema }),
  loginUser
);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
authRouter.get('/profile', authenticateToken, getUserProfile);

export default authRouter;