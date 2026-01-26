import * as repo from "./comment.repository";
import {
  transformComment,
  transformCommentWithReplies,
  transformCommentsList,
} from "./comment.transformers";
import {
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsQuery,
  CommentTargetType,
} from "./comment.validation";

// =====================
// === PUBLIC SERVICES ===
// =====================

/**
 * Get approved comments (public)
 */
export const getCommentsPublic = async (query: ListCommentsQuery) => {
  const result = await repo.findAllPublic(query);

  return {
    ...result,
    data: transformCommentsList(result.data),
  };
};

/**
 * Get comments by target (for orchestrator - public)
 */
export const getCommentsByTarget = async (
  targetType: CommentTargetType,
  targetId: string,
  options: {
    page?: number;
    limit?: number;
    includeReplies?: boolean;
  } = {},
) => {
  const result = await repo.findByTarget(targetType, targetId, {
    ...options,
    onlyApproved: true,
  });

  return {
    ...result,
    data: transformCommentsList(result.data, options.includeReplies),
  };
};

/**
 * Get comments count by targets (for orchestrator)
 */
export const getCommentsCountByTargets = async (
  targetType: CommentTargetType,
  targetIds: string[],
): Promise<Map<string, number>> => {
  return repo.getCommentsCountByTargets(targetType, targetIds, true);
};

/**
 * Get replies for a comment (public)
 */
export const getCommentReplies = async (parentId: string) => {
  const replies = await repo.findReplies(parentId, true);
  return transformCommentsList(replies);
};

/**
 * Create comment (authenticated user)
 */
export const createComment = async (userId: string, input: CreateCommentInput) => {
  // Validate target exists
  const targetExists = await repo.validateTarget(input.targetType, input.targetId);
  if (!targetExists) {
    const error: any = new Error("Target không tồn tại");
    error.statusCode = 404;
    throw error;
  }

  // Validate parent comment if provided
  if (input.parentId) {
    const parentValid = await repo.validateParentComment(
      input.parentId,
      input.targetType,
      input.targetId,
    );

    if (!parentValid) {
      const error: any = new Error("Parent comment không hợp lệ hoặc không tồn tại");
      error.statusCode = 400;
      throw error;
    }
  }

  const comment = await repo.create(userId, input);
  return transformComment(comment);
};

// =====================
// === ADMIN SERVICES ===
// =====================

/**
 * Get all comments (admin - includes not approved)
 */
export const getCommentsAdmin = async (query: ListCommentsQuery) => {
  const result = await repo.findAllAdmin(query);

  return {
    ...result,
    data: transformCommentsList(result.data),
  };
};

/**
 * Get comment by ID (admin)
 */
export const getCommentById = async (id: string) => {
  const comment = await repo.findById(id);

  if (!comment) {
    const error: any = new Error("Không tìm thấy comment");
    error.statusCode = 404;
    throw error;
  }

  return transformComment(comment);
};

/**
 * Update comment (admin)
 */
export const updateComment = async (id: string, input: UpdateCommentInput) => {
  // Check if comment exists
  await getCommentById(id);

  const comment = await repo.update(id, input);
  return transformComment(comment);
};

/**
 * Approve/Reject comment (admin)
 */
export const updateCommentApproval = async (id: string, isApproved: boolean) => {
  // Check if comment exists
  await getCommentById(id);

  const comment = await repo.update(id, { isApproved });
  return transformComment(comment);
};

/**
 * Delete comment (admin)
 */
export const deleteComment = async (id: string) => {
  // Check if comment exists
  await getCommentById(id);

  return repo.remove(id);
};

/**
 * Bulk approve/reject comments (admin)
 */
export const bulkApproveComments = async (commentIds: string[], isApproved: boolean) => {
  return repo.bulkApprove(commentIds, isApproved);
};

/**
 * Delete own comment (authenticated user)
 */
export const deleteOwnComment = async (id: string, userId: string) => {
  const comment = await getCommentById(id);

  if (comment.userId !== userId) {
    const error: any = new Error("Bạn không có quyền xóa comment này");
    error.statusCode = 403;
    throw error;
  }

  return repo.remove(id);
};
