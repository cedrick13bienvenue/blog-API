import { Response } from 'express';
import { BlogModel } from '../models/blog-model';
import { ResponseService } from './response';

export const generateSlug = (title: string): string => {
  return title.toLowerCase().split(' ').join('-');
};

/**
 * Looks up a blog by id, sending a 404 response itself if it doesn't exist.
 * Repeated inline in blog/comment/like controllers before this; callers
 * should `return` immediately when this resolves to null.
 */
export const findBlogOrRespond = async (
  blogId: string | number,
  res: Response
): Promise<BlogModel | null> => {
  const blog = await BlogModel.findByPk(blogId);
  if (!blog) {
    ResponseService({
      res,
      status: 404,
      success: false,
      message: 'Blog not found',
    });
    return null;
  }
  return blog;
};
