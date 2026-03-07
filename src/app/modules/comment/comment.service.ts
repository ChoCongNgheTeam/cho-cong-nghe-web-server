import * as repo from "./comment.repository";
import { transformComment, transformCommentsList } from "./comment.transformers";
import { CreateCommentInput, UpdateCommentInput, ListCommentsQuery, CommentTargetType } from "./comment.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";

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
  const replies = await repo.findReplies(parentId, true);
  return transformCommentsList(replies);
};

export const createComment = async (userId: string, input: CreateCommentInput) => {
  const targetExists = await repo.validateTarget(input.targetType, input.targetId);
  if (!targetExists) throw new NotFoundError("Target");

  if (input.parentId) {
    const parentValid = await repo.validateParentComment(input.parentId, input.targetType, input.targetId);
    if (!parentValid) throw new BadRequestError("Parent comment không hợp lệ hoặc không tồn tại");
  }

  const comment = await repo.create(userId, input);
  return transformComment(comment);
};

export const getCommentsAdmin = async (query: ListCommentsQuery) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: transformCommentsList(result.data) };
};

export const getCommentById = async (id: string) => {
  const comment = await repo.findById(id);
  if (!comment) throw new NotFoundError("Comment");
  return transformComment(comment);
};

export const updateComment = async (id: string, input: UpdateCommentInput) => {
  await getCommentById(id);
  const comment = await repo.update(id, input);
  return transformComment(comment);
};

export const updateCommentApproval = async (id: string, isApproved: boolean) => {
  await getCommentById(id);
  const comment = await repo.update(id, { isApproved });
  return transformComment(comment);
};

export const deleteComment = async (id: string) => {
  await getCommentById(id);
  return repo.remove(id);
};

export const bulkApproveComments = async (commentIds: string[], isApproved: boolean) => {
  return repo.bulkApprove(commentIds, isApproved);
};

export const deleteOwnComment = async (id: string, userId: string) => {
  const comment = await getCommentById(id);
  if (comment.userId !== userId) throw new ForbiddenError("Bạn không có quyền xóa comment này");
  return repo.remove(id);
};
