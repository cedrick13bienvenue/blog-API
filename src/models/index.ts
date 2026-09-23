import { getSequelize } from '../config/db';
import { UserModel, associateModels as associateUser } from './user-model';
import { BlogModel, associateModels as associateBlog } from './blog-model';
import { CommentModel, associateModels as associateComment } from './comment-model';
import { LikeModel, associateModels as associateLike } from './like-model';
import { NewsletterSubscriberModel, associateModels as associateNewsletter } from './newsletter-subscriber-model';

const models = { UserModel, BlogModel, CommentModel, LikeModel, NewsletterSubscriberModel };

// Set up associations
associateUser(models);
associateBlog(models);
associateComment(models);
associateLike(models);
associateNewsletter(models);

// Sync models with the database
export const syncModels = async () => {
  const sequelize = getSequelize();
  await sequelize.sync({ force: false }); // Use force: false to avoid index issues
};

export { UserModel, BlogModel, CommentModel, LikeModel, NewsletterSubscriberModel }; 