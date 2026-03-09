// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Author {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface BlogCard {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt: string;
  viewCount: number;
  status: BlogStatus;
  author: Author;
  createdAt: Date;
  publishedAt?: Date;
  commentsCount?: number;
  // Soft delete — chỉ xuất hiện trong response admin/trash
  deletedAt?: Date;
  deletedBy?: string;
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
  comments?: any[];
  commentsCount?: number;
  // Soft delete — chỉ xuất hiện trong response admin/trash
  deletedAt?: Date;
  deletedBy?: string;
}

// ─── Raw DB shapes ────────────────────────────────────────────────────────────

export interface RawBlogBase {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  imagePath: string | null;
  viewCount: number;
  status: BlogStatus;
  createdAt: Date;
  publishedAt: Date | null;
  author: {
    id: string;
    fullName: string | null;
    email: string;
    avatarImage: string | null;
  };
}

export interface RawBlogDetail extends RawBlogBase {
  updatedAt: Date;
}

// Admin raw — thêm soft delete fields
export interface RawBlogAdmin extends RawBlogDetail {
  deletedAt: Date | null;
  deletedBy: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogListResponse extends PaginatedResponse<BlogCard> {}
