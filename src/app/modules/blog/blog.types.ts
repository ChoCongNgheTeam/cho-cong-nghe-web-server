// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

/**
 * BlogType — phân loại nội dung bài viết.
 * Đồng bộ với Prisma enum BlogType trong schema.
 */
export enum BlogType {
  TIN_MOI = "TIN_MOI", // Tin tức mới
  DANH_GIA = "DANH_GIA", // Đánh giá - Tư vấn
  KHUYEN_MAI = "KHUYEN_MAI", // Khuyến mãi
  DIEN_MAY = "DIEN_MAY", // Điện máy - Gia dụng
  NOI_BAT = "NOI_BAT", // Nổi bật (editorial pick)
}

// Label hiển thị cho từng type — dùng ở FE + admin
export const BLOG_TYPE_LABELS: Record<BlogType, string> = {
  [BlogType.TIN_MOI]: "Tin mới",
  [BlogType.DANH_GIA]: "Đánh giá - Tư vấn",
  [BlogType.KHUYEN_MAI]: "Khuyến mãi",
  [BlogType.DIEN_MAY]: "Điện máy - Gia dụng",
  [BlogType.NOI_BAT]: "Nổi bật",
};

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Author {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

/**
 * Author với blog count — dùng cho filter dropdown FE
 */
export interface BlogAuthor extends Author {
  blogCount: number;
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
  type: BlogType;
  author: Author;
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  commentsCount?: number;
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
  type: BlogType;
  author: Author;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  comments?: any[];
  commentsCount?: number;
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
  type: BlogType;
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
