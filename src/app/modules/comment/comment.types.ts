// =====================
// === ENUMS ===
// =====================

export enum CommentTargetType {
  BLOG = "BLOG",
  PRODUCT = "PRODUCT",
  PAGE = "PAGE",
}

// =====================
// === SHARED TYPES ===
// =====================

export interface CommentUser {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

// =====================
// === COMMENT TYPES ===
// =====================

export interface Comment {
  id: string;
  userId: string;
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  isApproved: boolean;
  createdAt: Date;
  user: CommentUser;
  // For nested comments
  replies?: Comment[];
  repliesCount?: number;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
  repliesCount: number;
}

// =====================
// === RAW DB TYPES ===
// =====================

export interface RawComment {
  id: string;
  userId: string;
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId: string | null;
  isApproved: boolean;
  createdAt: Date;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarImage: string | null;
  };
}

// =====================
// === REQUEST TYPES ===
// =====================

export interface CreateCommentInput {
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content?: string;
  isApproved?: boolean;
}

export interface ListCommentsQuery {
  page: number;
  limit: number;
  targetType?: CommentTargetType;
  targetId?: string;
  isApproved?: boolean;
  parentId?: string | null; // null = top-level comments only
  sortBy: "createdAt";
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

export interface CommentListResponse extends PaginatedResponse<Comment> {}

// =====================
// === STATS TYPES ===
// =====================

export interface CommentsCountMap extends Map<string, number> {}
