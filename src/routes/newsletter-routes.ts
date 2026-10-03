import { Router } from 'express';
import { subscribeToNewsletter, unsubscribeFromNewsletter, getAllSubscribers, getSubscriberCount } from '../controllers/newsletter-controller';
import { authenticateToken } from '../middlewares/auth';

const newsletterRouter = Router();

/**
 * @swagger
 * /api/newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to subscribe
 *     responses:
 *       200:
 *         description: Successfully subscribed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     subscribedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid email or missing email
 *       409:
 *         description: Already subscribed
 *       500:
 *         description: Server error
 */
newsletterRouter.post('/subscribe', subscribeToNewsletter);

/**
 * @swagger
 * /api/newsletter/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to unsubscribe
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     unsubscribedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid email or missing email
 *       404:
 *         description: Email not found
 *       409:
 *         description: Already unsubscribed
 *       500:
 *         description: Server error
 */
newsletterRouter.post('/unsubscribe', unsubscribeFromNewsletter);

/**
 * @swagger
 * /api/newsletter/subscribers:
 *   get:
 *     summary: Get all newsletter subscribers (Admin only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     inactive:
 *                       type: number
 *                     subscribers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           email:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           subscribedAt:
 *                             type: string
 *                             format: date-time
 *                           unsubscribedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
newsletterRouter.get('/subscribers', authenticateToken, getAllSubscribers);

/**
 * @swagger
 * /api/newsletter/count:
 *   get:
 *     summary: Get newsletter subscriber count
 *     tags: [Newsletter]
 *     responses:
 *       200:
 *         description: Subscriber count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     inactive:
 *                       type: number
 *       500:
 *         description: Server error
 */
newsletterRouter.get('/count', getSubscriberCount);

export { newsletterRouter }; 