import { Comment, CommentUser, CommentWithReplies } from "./comment.types";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

//  Helpers

/**
 * user có thể null khi bị SetNull (user bị hard delete)
 */
const transformUser = (user: any): CommentUser | null => {
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.fullName ?? undefined,
    email: user.email,
    avatarImage: user.avatarImage ?? undefined,
  };
};

//  Transformers

export const transformComment = (comment: any): Comment => ({
  id: comment.id,
  userId: comment.userId ?? null,
  content: comment.content,
  targetType: comment.targetType,
  targetId: comment.targetId,
  // targetName được inject bởi repository (chỉ có ở admin queries)
  ...(comment.targetName != null && { targetName: comment.targetName }),
  parentId: comment.parentId ?? undefined,
  isApproved: comment.isApproved,
  createdAt: comment.createdAt,
  user: transformUser(comment.user),
  // Soft delete metadata — chỉ có khi select admin
  ...(comment.deletedAt !== undefined && { deletedAt: comment.deletedAt ?? undefined }),
  ...(comment.deletedBy !== undefined && { deletedBy: comment.deletedBy ?? undefined }),
});

export const transformCommentWithReplies = (comment: any): CommentWithReplies => {
  const replies: Comment[] = comment.replies ? comment.replies.map(transformComment) : [];

  return {
    ...transformComment(comment),
    replies,
    repliesCount: replies.length,
  };
};

export const transformCommentsList = (comments: any[], includeReplies = false): Comment[] => {
  if (includeReplies) {
    return comments.map(transformCommentWithReplies);
  }
  return comments.map(transformComment);
};
