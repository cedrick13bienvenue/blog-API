import { Request, Response } from 'express';
import { BlogModel, BlogAttributes } from '../models/blog-model';
import { LikeModel } from '../models/like-model';
import { CommentModel } from '../models/comment-model';
import { generateSlug } from '../utils/helper';
import { ResponseService } from '../utils/response';
import { uploadFile } from '../utils/upload';
import { triggerBlogCreated } from '../services/event-service';

export const getAllBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await BlogModel.findAll();
    // Get likes and comments count for each blog
    const blogsWithCounts = await Promise.all(
      blogs.map(async (blog) => {
        const likesCount = await LikeModel.count({ where: { blog: blog.id } });
        const commentsCount = await CommentModel.count({ where: { blog: blog.id } });
        return {
          ...blog.toJSON(),
          likesCount,
          commentsCount,
        };
      })
    );
    ResponseService({ res, data: blogsWithCounts });
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getABlog = async (req: Request, res: Response) => {
  try {
    const blog = await BlogModel.findByPk(req.params.id);
    if (!blog) {
      return ResponseService({
        res,
        status: 404,
        success: false,
        message: 'Blog not found',
      });
    }
    // Get likes and comments count
    const likesCount = await LikeModel.count({ where: { blog: blog.id } });
    const commentsCount = await CommentModel.count({ where: { blog: blog.id } });
    const blogWithCounts = {
      ...blog.toJSON(),
      likesCount,
      commentsCount,
    };
    ResponseService({ res, data: blogWithCounts });
  } catch (error) {
    ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, description, content, isPublished } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadFile(req.file);
    }
    // Convert string 'true'/'false' to boolean
    const isPublishedBool = isPublished === 'true' || isPublished === true;
    const cleanTitle = title?.trim();
    const blog = await BlogModel.create({
      title: cleanTitle,
      slug: generateSlug(cleanTitle),
      description,
      author: (req.user as any)?.id, // Use user id from session
      content,
      isPublished: isPublishedBool,
      image: imageUrl,
      createdAt: new Date(),
    });

    // Trigger blog created event for newsletter notifications
    if (isPublishedBool) {
      try {
        triggerBlogCreated(blog.toJSON());
        console.log('🎯 Blog created event triggered for newsletter notifications');
      } catch (error) {
        console.error('❌ Failed to trigger blog created event:', error);
        // Don't fail the blog creation if event fails
      }
    }

    ResponseService({
      res,
      data: blog,
      message: 'Blog created successfully',
      status: 201,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body, updatedAt: new Date() };
    // Convert string 'true'/'false' to boolean if isPublished is provided
    if (updateData.isPublished !== undefined) {
      updateData.isPublished = updateData.isPublished === 'true' || updateData.isPublished === true;
    }
    if (updateData.title) {
      const cleanTitle = updateData.title.trim();
      updateData.title = cleanTitle;
      updateData.slug = generateSlug(cleanTitle);
    }
    if (req.file) {
      updateData.image = await uploadFile(req.file);
    }
    const [affectedRows, [updatedBlog]] = await BlogModel.update(updateData, {
      where: { id: req.params.id },
      returning: true,
    });
    if (!updatedBlog) {
      return ResponseService({
        res,
        status: 404,
        success: false,
        message: 'Blog not found',
      });
    }
    ResponseService({
      res,
      data: updatedBlog,
      message: 'Blog updated successfully',
    });
  } catch (error) {
    console.error('Update blog error:', error);
    ResponseService({
      res,
      status: 500,
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const [affectedRows, [blog]] = await BlogModel.update(
      { deletedAt: new Date() },
      { where: { id: req.params.id }, returning: true }
    );
    if (!blog) {
      return ResponseService({
        res,
        status: 404,
        success: false,
        message: 'Blog not found',
      });
    }
    ResponseService({
      res,
      data: blog,
      message: 'Blog soft-deleted successfully',
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

export const hardDeleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) {
      return ResponseService({
        res,
        status: 400,
        success: false,
        message: 'Blog id is required in request body',
      });
    }
    const deleted = await BlogModel.destroy({ where: { id } });
    if (!deleted) {
      return ResponseService({
        res,
        status: 404,
        success: false,
        message: 'Blog not found',
      });
    }
    ResponseService({
      res,
      message: 'Blog permanently deleted successfully',
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