import { Request, Response } from "express";
import * as commentService from "./comment.service";
import { ListCommentsQuery } from "./comment.validation";

export const getCommentsPublicHandler = async (req: Request, res: Response) => {
  const result = await commentService.getCommentsPublic(req.query as unknown as ListCommentsQuery);
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

export const createCommentHandler = async (req: Request, res: Response) => {
  const comment = await commentService.createComment(req.user!.id, req.body);
  res.status(201).json({ data: comment, message: "Tạo comment thành công. Chờ duyệt." });
};

export const deleteOwnCommentHandler = async (req: Request, res: Response) => {
  await commentService.deleteOwnComment(req.params.id, req.user!.id);
  res.json({ message: "Xóa comment thành công" });
};

export const getCommentsAdminHandler = async (req: Request, res: Response) => {
  const result = await commentService.getCommentsAdmin(req.query as unknown as ListCommentsQuery);
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
  const comment = await commentService.getCommentById(req.params.id);
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

export const deleteCommentHandler = async (req: Request, res: Response) => {
  await commentService.deleteComment(req.params.id);
  res.json({ message: "Xóa comment thành công" });
};

export const bulkApproveCommentsHandler = async (req: Request, res: Response) => {
  const { commentIds, isApproved } = req.body;
  await commentService.bulkApproveComments(commentIds, isApproved);
  res.json({
    message: isApproved ? "Duyệt comments thành công" : "Từ chối comments thành công",
  });
};
