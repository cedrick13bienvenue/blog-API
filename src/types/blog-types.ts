export interface IBlog {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateBlogInput {
  title: string;
  description: string;
  content: string;
  author: string;
  isPublished: boolean;
}

export interface UpdateBlogInput {
  title?: string;
  description?: string;
  content?: string;
  author?: string;
  isPublished?: boolean;
}

export interface BlogQuery {
  page?: number;
  limit?: number;
  search?: string;
  author?: string;
  isPublished?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
