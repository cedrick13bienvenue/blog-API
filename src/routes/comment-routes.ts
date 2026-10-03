import { Router } from 'express';
import { createComment, getCommentsForBlog } from '../controllers/comment-controller';
import { authenticateToken } from '../middlewares/auth';
import { roleChecker } from '../middlewares/role-checker';
import { ValidationMiddleware } from '../middlewares/validate-blog';

export const commentRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: Blog comment routes
 *
 * /blogs/{blogId}/comments:
 *   post:
 *     tags: [Comment]
 *     summary: Add a comment to a blog (user only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Comment added
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Comment]
 *     summary: Get comments for a blog
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
commentRouter.post(
  '/blogs/:blogId/comments',
  authenticateToken,
  roleChecker(['user']),
  createComment
);

commentRouter.get('/blogs/:blogId/comments', getCommentsForBlog);