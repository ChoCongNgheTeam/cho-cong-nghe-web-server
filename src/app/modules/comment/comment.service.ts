import { moderateContent } from "@/services/moderation";
import * as repo from "./comment.repository";
import { transformComment, transformCommentsList } from "./comment.transformers";
import { CreateCommentInput, UpdateCommentInput, ListCommentsQuery, CommentTargetType } from "./comment.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import { sendCommentNewAdminNotification } from "@/app/modules/notification/notification.service";
import prisma from "@/config/db";

// ── Helper ────────────────────────────────────────────────────────────────────

const assertCommentExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const comment = await repo.findById(id, options);
  if (!comment) throw new NotFoundError("Comment");
  return comment;
};

/**
 * Lấy tên target để hiển thị trong notification.
 * Hiện tại hỗ trợ PRODUCT — thêm case khác nếu targetType mở rộng sau này.
 */
const resolveTargetName = async (targetType: CommentTargetType, targetId: string): Promise<string> => {
  try {
    if (targetType === "PRODUCT") {
      const product = await prisma.products.findUnique({
        where: { id: targetId },
        select: { name: true },
      });
      return product?.name ?? targetId;
    }
    // Thêm case mới ở đây nếu cần: POST, NEWS, ...
    return targetId;
  } catch {
    return targetId;
  }
};

// ── Public ────────────────────────────────────────────────────────────────────

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
  await assertCommentExists(parentId);
  const replies = await repo.findReplies(parentId, true);
  return transformCommentsList(replies);
};

// ── Authenticated user ────────────────────────────────────────────────────────

export const createComment = async (userId: string, input: CreateCommentInput) => {
  // 1. Validate target tồn tại
  const targetExists = await repo.validateTarget(input.targetType, input.targetId);
  if (!targetExists) throw new NotFoundError("Target");

  // 2. Validate parent comment nếu có
  if (input.parentId) {
    const parentValid = await repo.validateParentComment(input.parentId, input.targetType, input.targetId);
    if (!parentValid) {
      throw new BadRequestError("Parent comment không hợp lệ, đã bị xóa, hoặc không thuộc cùng target");
    }
  }

  // 3. Lưu DB với isApproved = false
  const comment = await repo.create(userId, input);

  // 4. AI moderation
  let result: { comment: ReturnType<typeof transformComment>; autoApproved: boolean; reason?: string };
  try {
    const moderation = await moderateContent("comment", comment.content || "");
    if (moderation.approved) {
      const approved = await repo.update(comment.id, { isApproved: true });
      result = { comment: transformComment(approved), autoApproved: true };
    } else {
      result = { comment: transformComment(comment), autoApproved: false, reason: moderation.reason };
    }
  } catch (error) {
    console.error("Moderation error:", error);
    result = { comment: transformComment(comment), autoApproved: false };
  }

  // 5. Notify admin/staff — fire-and-forget, không block response
  setImmediate(async () => {
    try {
      const [user, targetName] = await Promise.all([prisma.users.findUnique({ where: { id: userId }, select: { fullName: true } }), resolveTargetName(input.targetType, input.targetId)]);

      await sendCommentNewAdminNotification(user?.fullName ?? "Khách hàng", targetName, comment.id, input.targetId);
    } catch (err) {
      console.error("[Notification] Lỗi gửi notify comment mới:", err);
    }
  });

  return result;
};

/**
 * User tự xóa comment của mình — soft delete, KHÔNG xóa replies.
 */
export const deleteOwnComment = async (id: string, userId: string) => {
  const comment = await assertCommentExists(id);

  if ((comment as any).userId !== userId) {
    throw new ForbiddenError("Bạn không có quyền xóa comment này");
  }

  return repo.softDeleteOwn(id, userId);
};

// ── Staff & Admin ─────────────────────────────────────────────────────────────

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

// ── Soft delete — Staff & Admin ───────────────────────────────────────────────

export const softDeleteComment = async (id: string, deletedById: string) => {
  await assertCommentExists(id);
  return repo.softDelete(id, deletedById);
};

export const bulkSoftDeleteComments = async (ids: string[], deletedById: string) => {
  return repo.bulkSoftDelete(ids, deletedById);
};

// ── Admin only ────────────────────────────────────────────────────────────────

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
