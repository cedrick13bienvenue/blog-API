import fs from 'fs';
import path from 'path';
import { sequelize } from './src/config/db';
import { UserModel } from './src/models/user-model';
import { BlogModel } from './src/models/blog-model';
import { CommentModel } from './src/models/comment-model';
import { LikeModel } from './src/models/like-model';

// Helper to read JSON files
function readJSON(filename: string) {
    const content = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
    
    if (!content.trim()) return [];
    
    // Handle JSONL format (default mongoexport)
    if (content.includes('\n') && !content.trim().startsWith('[')) {
      return content.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
    }
    
    return JSON.parse(content);
  }

(async () => {
  try {
    await sequelize.sync();
    // 1. Import users
    const users = readJSON('users.json');
    const userIdMap: Record<string, number> = {};
    for (const user of users) {
      const { _id, ...userData } = user;
      const created = await UserModel.create(userData);
      userIdMap[_id.$oid || _id] = created.id;
    }
    console.log('Users imported.');

    // 2. Import blogs
    const blogs = readJSON('blogs.json');
    const blogIdMap: Record<string, number> = {};
    for (const blog of blogs) {
      const { _id, author, ...blogData } = blog;
      const created = await BlogModel.create({
        ...blogData,
        author: userIdMap[author?.$oid || author],
      });
      blogIdMap[_id.$oid || _id] = created.id;
    }
    console.log('Blogs imported.');

    // 3. Import comments
    const comments = readJSON('comments.json');
    for (const comment of comments) {
      const { _id, blog, user, ...commentData } = comment;
      await CommentModel.create({
        ...commentData,
        blog: blogIdMap[blog?.$oid || blog],
        user: userIdMap[user?.$oid || user],
      });
    }
    console.log('Comments imported.');

    // 4. Import likes
    const likes = readJSON('likes.json');
    for (const like of likes) {
      const { _id, blog, user, ...likeData } = like;
      await LikeModel.create({
        ...likeData,
        blog: blogIdMap[blog?.$oid || blog],
        user: userIdMap[user?.$oid || user],
      });
    }
    console.log('Likes imported.');

    console.log('All data imported successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
})(); 