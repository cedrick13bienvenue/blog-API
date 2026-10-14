import { Request, Response } from 'express';
import { CommentModel, CommentAttributes } from '../models/comment-model';
import { BlogModel } from '../models/blog-model';
import { UserModel } from '../models/user-model';
import { ResponseService } from '../utils/response';
import { IRequestUser } from '../middlewares/protect';
import { asyncHandler } from '../utils/async-handler';

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const userId = (req.user as IRequestUser['user'])?.id;
  const { content } = req.body;

  if (!userId) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      message: 'Unauthorized',
    });
  }

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
    user: Number(userId),
    content,
  });

  ResponseService({
    res,
    status: 201,
    message: 'Comment added successfully',
    data: comment,
  });
});

export const getCommentsForBlog = asyncHandler(async (req: Request, res: Response) => {
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
});
