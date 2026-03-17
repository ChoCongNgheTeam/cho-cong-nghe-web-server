import { Request, Response } from "express";
import * as commentService from "./comment.service";
import { listCommentsSchema } from "./comment.validation";

//  Public

export const getCommentsPublicHandler = async (req: Request, res: Response) => {
  const query = listCommentsSchema.parse(req.query);
  const result = await commentService.getCommentsPublic(query);

  res.json({
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Lấy danh sách comment thành công",
  });
};

export const getCommentRepliesHandler = async (req: Request, res: Response) => {
  const replies = await commentService.getCommentReplies(req.params.id);
  res.json({ data: replies, message: "Lấy replies thành công" });
};

//  Authenticated user

export const createCommentHandler = async (req: Request, res: Response) => {
  const result = await commentService.createComment(req.user!.id, req.body);

  const message = result.autoApproved ? "Bình luận của bạn đã được đăng." : "Bình luận của bạn đang chờ kiểm duyệt.";

  res.status(201).json({ data: result.comment, message });
};
/**
 * User tự xóa comment của mình — soft delete, replies không bị kéo theo
 */
export const deleteOwnCommentHandler = async (req: Request, res: Response) => {
  await commentService.deleteOwnComment(req.params.id, req.user!.id);
  res.json({ message: "Xóa comment của mình thành công" });
};

//  Staff & Admin: list, detail, approve, update, soft delete

export const getCommentsAdminHandler = async (req: Request, res: Response) => {
  const query = listCommentsSchema.parse(req.query);
  const result = await commentService.getCommentsAdmin(query);

  res.json({
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Lấy danh sách comment thành công",
  });
};

export const getCommentDetailHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const comment = await commentService.getCommentById(req.params.id, { isAdmin });
  res.json({ data: comment, message: "Lấy chi tiết comment thành công" });
};

export const updateCommentHandler = async (req: Request, res: Response) => {
  const comment = await commentService.updateComment(req.params.id, req.body);
  res.json({ data: comment, message: "Cập nhật comment thành công" });
};

export const approveCommentHandler = async (req: Request, res: Response) => {
  const { isApproved } = req.body;
  const comment = await commentService.updateCommentApproval(req.params.id, isApproved);
  res.json({
    data: comment,
    message: isApproved ? "Duyệt comment thành công" : "Từ chối comment thành công",
  });
};

export const bulkApproveCommentsHandler = async (req: Request, res: Response) => {
  const { commentIds, isApproved } = req.body;
  await commentService.bulkApproveComments(commentIds, isApproved);
  res.json({
    message: isApproved ? "Duyệt comments thành công" : "Từ chối comments thành công",
  });
};

/**
 * Soft delete — Staff & Admin.
 * Replies cũng bị soft delete theo.
 */
export const deleteCommentHandler = async (req: Request, res: Response) => {
  await commentService.softDeleteComment(req.params.id, req.user!.id);
  res.json({ message: "Xóa comment thành công" });
};

export const bulkDeleteCommentsHandler = async (req: Request, res: Response) => {
  const { commentIds } = req.body;
  await commentService.bulkSoftDeleteComments(commentIds, req.user!.id);
  res.json({ message: "Xóa comments thành công" });
};

//  Admin only

export const restoreCommentHandler = async (req: Request, res: Response) => {
  const comment = await commentService.restoreComment(req.params.id);
  res.json({ data: comment, message: "Khôi phục comment thành công" });
};

export const bulkRestoreCommentsHandler = async (req: Request, res: Response) => {
  const { commentIds } = req.body;
  await commentService.bulkRestoreComments(commentIds);
  res.json({ message: "Khôi phục comments thành công" });
};

export const hardDeleteCommentHandler = async (req: Request, res: Response) => {
  await commentService.hardDeleteComment(req.params.id);
  res.json({ message: "Xóa comment vĩnh viễn thành công" });
};

export const getDeletedCommentsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await commentService.getDeletedComments({ page, limit });

  res.json({
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Lấy danh sách comment đã xóa thành công",
  });
};
