import { moderateContent } from "@/services/moderation";
import * as repo from "./comment.repository";
import { transformComment, transformCommentsList } from "./comment.transformers";
import { CreateCommentInput, UpdateCommentInput, ListCommentsQuery, CommentTargetType } from "./comment.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";

//  Helper

const assertCommentExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const comment = await repo.findById(id, options);
  if (!comment) throw new NotFoundError("Comment");
  return comment;
};

//  Public

export const getCommentsPublic = async (query: ListCommentsQuery) => {
  const result = await repo.findAllPublic(query);
  return { ...result, data: transformCommentsList(result.data) };
};

export const getCommentsByTarget = async (targetType: CommentTargetType, targetId: string, options: { page?: number; limit?: number; includeReplies?: boolean } = {}) => {
  const result = await repo.findByTarget(targetType, targetId, {
    ...options,
    onlyApproved: true,
  });
  return { ...result, data: transformCommentsList(result.data, options.includeReplies) };
};

export const getCommentsCountByTargets = async (targetType: CommentTargetType, targetIds: string[]): Promise<Map<string, number>> => {
  return repo.getCommentsCountByTargets(targetType, targetIds, true);
};

export const getCommentReplies = async (parentId: string) => {
  // Kiểm tra parent tồn tại và chưa bị xóa
  await assertCommentExists(parentId);
  const replies = await repo.findReplies(parentId, true);
  return transformCommentsList(replies);
};

//  Authenticated user: tạo, tự xóa comment của mình
export const createComment = async (userId: string, input: CreateCommentInput) => {
  const targetExists = await repo.validateTarget(input.targetType, input.targetId);
  if (!targetExists) throw new NotFoundError("Target");

  if (input.parentId) {
    const parentValid = await repo.validateParentComment(input.parentId, input.targetType, input.targetId);
    if (!parentValid) {
      throw new BadRequestError("Parent comment không hợp lệ, đã bị xóa, hoặc không thuộc cùng target");
    }
  }

  // Lưu DB trước với isApproved = false
  const comment = await repo.create(userId, input);

  // Chạy AI moderation
  try {
    const moderation = await moderateContent("comment", comment.content || "");
    if (moderation.approved) {
      // Pass → auto approve
      const approved = await repo.update(comment.id, { isApproved: true });
      return { comment: transformComment(approved), autoApproved: true };
    } else {
      // Reject → giữ isApproved = false, admin review sau
      return { comment: transformComment(comment), autoApproved: false, reason: moderation.reason };
    }
  } catch (error) {
    // AI fail → giữ isApproved = false, admin review sau (silent fail)
    console.error("Moderation error:", error);
    return { comment: transformComment(comment), autoApproved: false };
  }
};

/**
 * User tự xóa comment của mình — soft delete, KHÔNG xóa replies.
 * Replies của người khác vẫn hiển thị dù parent bị ẩn.
 */
export const deleteOwnComment = async (id: string, userId: string) => {
  const comment = await assertCommentExists(id);

  if ((comment as any).userId !== userId) {
    throw new ForbiddenError("Bạn không có quyền xóa comment này");
  }

  return repo.softDeleteOwn(id, userId);
};

//  Staff & Admin: list, detail, approve

export const getCommentsAdmin = async (query: ListCommentsQuery) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: transformCommentsList(result.data) };
};

export const getCommentById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const comment = await assertCommentExists(id, options);
  return transformComment(comment);
};

export const updateComment = async (id: string, input: UpdateCommentInput) => {
  await assertCommentExists(id);
  const comment = await repo.update(id, input);
  return transformComment(comment);
};

export const updateCommentApproval = async (id: string, isApproved: boolean) => {
  await assertCommentExists(id);
  const comment = await repo.update(id, { isApproved });
  return transformComment(comment);
};

export const bulkApproveComments = async (commentIds: string[], isApproved: boolean) => {
  return repo.bulkApprove(commentIds, isApproved);
};

//  Soft delete — Staff & Admin

/**
 * Soft delete — replies cũng bị soft delete theo.
 */
export const softDeleteComment = async (id: string, deletedById: string) => {
  await assertCommentExists(id);
  return repo.softDelete(id, deletedById);
};

export const bulkSoftDeleteComments = async (ids: string[], deletedById: string) => {
  return repo.bulkSoftDelete(ids, deletedById);
};

//  Admin only: restore, hard delete, trash

export const restoreComment = async (id: string) => {
  const comment = (await repo.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!comment) throw new NotFoundError("Comment");
  if (!comment.deletedAt) throw new BadRequestError("Comment này chưa bị xóa");

  const restored = await repo.restore(id);
  return transformComment(restored);
};

export const bulkRestoreComments = async (ids: string[]) => {
  return repo.bulkRestore(ids);
};

/**
 * Hard delete — Admin only, CHỈ sau khi đã soft delete.
 * Hard delete replies trước, rồi mới hard delete comment.
 */
export const hardDeleteComment = async (id: string) => {
  const comment = (await repo.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!comment) throw new NotFoundError("Comment");

  if (!comment.deletedAt) {
    throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn. Dùng DELETE /admin/comments/:id");
  }

  return repo.hardDelete(id);
};

export const getDeletedComments = async (query: Pick<ListCommentsQuery, "page" | "limit">) => {
  const result = await repo.findAllDeleted(query);
  return { ...result, data: transformCommentsList(result.data) };
};
