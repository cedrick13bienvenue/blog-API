import { Request, Response } from 'express';
import { LikeModel, LikeAttributes } from '../models/like-model';
import { BlogModel } from '../models/blog-model';
import { UserModel } from '../models/user-model';
import { ResponseService } from '../utils/response';
import { IRequestUser } from '../middlewares/protect';
import { asyncHandler } from '../utils/async-handler';

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const userId = (req.user as IRequestUser['user'])?.id;
  if (!userId) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      message: 'Unauthorized',
    });
  }

  // Check if blog exists
  const blog = await BlogModel.findByPk(blogId);
  if (!blog) {
    return ResponseService({
      res,
      status: 404,
      success: false,
      message: 'Blog not found',
    });
  }

  // Check if user already liked this blog
  const existingLike = await LikeModel.findOne({ where: { blog: blogId, user: userId } });

  if (existingLike) {
    // Unlike: remove the like
    await LikeModel.destroy({ where: { id: existingLike.id } });
    return ResponseService({
      res,
      message: 'Blog unliked successfully',
      data: { liked: false },
    });
  } else {
    // Like: create new like
    await LikeModel.create({ blog: Number(blogId), user: Number(userId) });
    return ResponseService({
      res,
      message: 'Blog liked successfully',
      data: { liked: true },
    });
  }
});

export const getBlogLikes = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = req.params;

  // Get likes count and list of users who liked
  const likes = await LikeModel.findAll({
    where: { blog: blogId },
    include: [{ model: UserModel, attributes: ['name', 'email'] }],
  });

  ResponseService({
    res,
    message: 'Blog likes fetched successfully',
    data: {
      count: likes.length,
      likes: likes,
    },
  });
});
