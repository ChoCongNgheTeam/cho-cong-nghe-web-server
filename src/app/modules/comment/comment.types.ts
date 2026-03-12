export enum CommentTargetType {
  BLOG = "BLOG",
  PRODUCT = "PRODUCT",
  PAGE = "PAGE",
}

//  Shared

export interface CommentUser {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

//  Response shapes

export interface Comment {
  id: string;
  userId: string | null; // nullable vì user có thể bị SetNull khi xóa
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  isApproved: boolean;
  createdAt: Date;
  user: CommentUser | null; // null khi user bị xóa (SetNull)
  repliesCount?: number;
  // Soft delete — chỉ xuất hiện trong response admin/trash
  deletedAt?: Date;
  deletedBy?: string;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

//  Raw DB shapes

export interface RawComment {
  id: string;
  userId: string | null;
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
  } | null;
}

// Admin raw — thêm soft delete fields
export interface RawCommentAdmin extends RawComment {
  deletedAt: Date | null;
  deletedBy: string | null;
}

//  Pagination

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentListResponse extends PaginatedResponse<Comment> {}
