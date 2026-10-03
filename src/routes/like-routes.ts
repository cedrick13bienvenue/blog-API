import { Router } from 'express';
import { toggleLike, getBlogLikes } from '../controllers/like-controller';
import { authenticateToken } from '../middlewares/auth';
import { roleChecker } from '../middlewares/role-checker';
import { ValidationMiddleware } from '../middlewares/validate-blog';

export const likeRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Like
 *     description: Blog like routes
 *
 * /blogs/{blogId}/like:
 *   post:
 *     tags: [Like]
 *     summary: Like or unlike a blog (user only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 *       401:
 *         description: Unauthorized
 *
 * /blogs/{blogId}/likes:
 *   get:
 *     tags: [Like]
 *     summary: Get likes for a blog
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of likes
 */
likeRouter.post(
  '/blogs/:blogId/like',
  authenticateToken,
  roleChecker(['user']),
  toggleLike
);

likeRouter.get(
  '/blogs/:blogId/likes',
  getBlogLikes
);