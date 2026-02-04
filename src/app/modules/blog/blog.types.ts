// =====================
// === ENUMS ===
// =====================

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

// =====================
// === SHARED TYPES ===
// =====================

export interface Author {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

// =====================
// === BLOG TYPES ===
// =====================

export interface BlogCard {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  excerpt: string; // First 200 chars of content
  viewCount: number;
  status: BlogStatus;
  author: Author;
  createdAt: Date;
  publishedAt?: Date;
  // Placeholder for comments count (will be populated by orchestrator)
  commentsCount?: number;
}

export interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  viewCount: number;
  status: BlogStatus;
  author: Author;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  // Placeholder for comments (will be populated by orchestrator)
  comments?: any[];
  commentsCount?: number;
}

// =====================
// === RAW DB TYPES ===
// =====================

export interface RawBlog {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  viewCount: number;
  status: BlogStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  author: {
    id: string;
    fullName: string | null;
    email: string;
    avatarImage: string | null;
  };
}

// =====================
// === REQUEST TYPES ===
// =====================

export interface CreateBlogInput {
  title: string;
  content: string;
  thumbnail?: string;
  status?: BlogStatus;
  publishedAt?: Date;
}

export interface UpdateBlogInput {
  title?: string;
  content?: string;
  thumbnail?: string;
  status?: BlogStatus;
  publishedAt?: Date;
}

export interface ListBlogsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: BlogStatus;
  authorId?: string;
  sortBy: "createdAt" | "publishedAt" | "viewCount" | "title";
  sortOrder: "asc" | "desc";
}

// =====================
// === RESPONSE TYPES ===
// =====================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogListResponse extends PaginatedResponse<BlogCard> {}
