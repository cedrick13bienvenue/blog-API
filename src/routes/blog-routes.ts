import { Router } from 'express';
import {
  createBlog,
  getAllBlogs,
  getABlog,
  updateBlog,
  deleteBlog,
  hardDeleteBlog
} from '../controllers/blog-controller';

import { authenticateToken } from '../middlewares/auth';
import { roleChecker } from '../middlewares/role-checker';

import { upload } from '../utils/upload'; 

/**
 * @swagger
 * tags:
 *   - name: Blog
 *     description: Blog CRUD routes
 *
 * /blogs:
 *   get:
 *     tags: [Blog]
 *     summary: Get all blogs
 *     responses:
 *       200:
 *         description: List of blogs
 *   post:
 *     tags: [Blog]
 *     summary: Create a new blog (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Blog created
 *       401:
 *         description: Unauthorized
 *
 * /blogs/{id}:
 *   get:
 *     tags: [Blog]
 *     summary: Get a blog by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog found
 *   put:
 *     tags: [Blog]
 *     summary: Update a blog (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [Blog]
 *     summary: Soft delete a blog (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog soft-deleted
 *       401:
 *         description: Unauthorized
 *
 * /blogs/hard-delete:
 *   delete:
 *     tags: [Blog]
 *     summary: Hard delete a blog (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog permanently deleted
 */
export const blogRouter = Router();

blogRouter.get('/blogs', getAllBlogs);

blogRouter.get(
  '/blogs/:id',
  getABlog
);

blogRouter.post(
  '/blogs',
  authenticateToken,
  roleChecker(['admin']),
  upload.single('image'), 
  createBlog
);

blogRouter.put(
  '/blogs/:id',
  authenticateToken,
  roleChecker(['admin']),
  upload.single('image'), 
  updateBlog
);

blogRouter.delete(
  '/blogs/:id',
  authenticateToken,
  roleChecker(['admin']),
  deleteBlog
);

blogRouter.delete(
  '/blogs/hard-delete',
  authenticateToken,
  roleChecker(['admin']),
  hardDeleteBlog
);
