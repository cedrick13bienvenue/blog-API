import { Request, Response } from 'express';
import { CommentModel, CommentAttributes } from '../models/comment-model';
import { BlogModel } from '../models/blog-model';
import { UserModel } from '../models/user-model';
import { ResponseService } from '../utils/response';
// Removed: import { IRequestUser } from '../middlewares/protect';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = (req.user as any)?.id; // from session
    const { content } = req.body;

    // Check blog exists
    const blog = await BlogModel.findByPk(blogId);
    if (!blog) {
      return ResponseService({
        res,
        status: 404,
        success: false,
        message: 'Blog not found',
      });
    }

    // Create comment
    const comment = await CommentModel.create({
      blog: Number(blogId),
      user: userId,
      content,
    });

    ResponseService({
      res,
      status: 201,
      message: 'Comment added successfully',
      data: comment,
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

export const getCommentsForBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    // Find comments for blog with user info (include)
    const comments = await CommentModel.findAll({
      where: { blog: blogId },
      include: [{ model: UserModel, attributes: ['name', 'email'] }],
    });

    ResponseService({
      res,
      status: 200,
      message: 'Comments fetched successfully',
      data: comments,
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
