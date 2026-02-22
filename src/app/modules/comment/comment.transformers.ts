import { Comment, CommentUser, CommentWithReplies } from "./comment.types";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const transformUser = (user: any): CommentUser => ({
  id: user.id,
  fullName: user.fullName || undefined,
  email: user.email,
  avatarImage: user.avatarImage || undefined,
});

export const transformComment = (comment: any): Comment => {
  return {
    id: comment.id,
    userId: comment.userId,
    content: comment.content,
    targetType: comment.targetType,
    targetId: comment.targetId,
    parentId: comment.parentId || undefined,
    isApproved: comment.isApproved,
    createdAt: comment.createdAt,
    user: transformUser(comment.user),
  };
};

export const transformCommentWithReplies = (comment: any): CommentWithReplies => {
  const replies = comment.replies ? comment.replies.map(transformComment) : [];

  return {
    ...transformComment(comment),
    replies,
    repliesCount: replies.length,
  };
};

export const transformCommentsList = (
  comments: any[],
  includeReplies: boolean = false,
): Comment[] => {
  if (includeReplies) {
    return comments.map(transformCommentWithReplies);
  }
  return comments.map(transformComment);
};
