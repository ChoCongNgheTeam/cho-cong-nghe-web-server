import { Comment, CommentUser, CommentWithReplies } from "./comment.types";

/**
 * Transform user data
 */
const transformUser = (user: any): CommentUser => ({
  id: user.id,
  fullName: user.fullName || undefined,
  email: user.email,
  avatarImage: user.avatarImage || undefined,
});

/**
 * Transform comment (without replies)
 */
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

/**
 * Transform comment with replies
 */
export const transformCommentWithReplies = (comment: any): CommentWithReplies => {
  const replies = comment.replies ? comment.replies.map(transformComment) : [];

  return {
    ...transformComment(comment),
    replies,
    repliesCount: replies.length,
  };
};

/**
 * Transform list of comments with optional replies
 */
export const transformCommentsList = (
  comments: any[],
  includeReplies: boolean = false,
): Comment[] => {
  if (includeReplies) {
    return comments.map(transformCommentWithReplies);
  }
  return comments.map(transformComment);
};
