export enum CommentTargetType {
  BLOG = "BLOG",
  PRODUCT = "PRODUCT",
  PAGE = "PAGE",
}

export interface CommentUser {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

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
  repliesCount?: number;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

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
  parentId?: string | null;
  sortBy: "createdAt";
  sortOrder: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentListResponse extends PaginatedResponse<Comment> {}
