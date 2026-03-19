import { Request, Response } from "express";
import * as reviewService from "./review.service";
import { listReviewsSchema } from "./review.validation";
import { ReviewStatus } from "@prisma/client";

// ── Public / User ──────────────────────────────────────────────────────────

export const createReviewHandler = async (req: Request, res: Response) => {
  const result = await reviewService.createUserReview(req.user!.id, req.body);
  const message = result.autoApproved ? "Đánh giá của bạn đã được đăng." : "Đánh giá của bạn đang chờ kiểm duyệt.";
  res.status(201).json({ data: result.review, message });
};

/**
 * GET /reviews/product/:productId
 * Response: { data: { reviews: [...], stats: { average, total, distribution } }, total, message }
 */
export const getProductReviewsHandler = async (req: Request, res: Response) => {
  const result = await reviewService.getReviewsByProduct(req.params.productId);
  res.json({
    data: result.reviews,
    stats: result.stats,
    total: result.stats.total,
    message: "Lấy danh sách đánh giá sản phẩm thành công",
  });
};

// ── Admin ──────────────────────────────────────────────────────────────────

export const getAllReviewsAdminHandler = async (req: Request, res: Response) => {
  const query = listReviewsSchema.parse(req.query);
  const result = await reviewService.getAllReviewsAdmin(query);
  res.json({
    data: result.data,
    pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy tất cả đánh giá thành công",
  });
};

export const getReviewDetailHandler = async (req: Request, res: Response) => {
  const review = await reviewService.getReviewById(req.params.id);
  res.json({ data: review, message: "Lấy chi tiết đánh giá thành công" });
};

export const updateReviewAdminHandler = async (req: Request, res: Response) => {
  const review = await reviewService.updateReviewAdmin(req.params.id, req.body);
  res.json({ data: review, message: "Cập nhật đánh giá thành công" });
};

export const approveReviewHandler = async (req: Request, res: Response) => {
  const { isApproved } = req.body;
  const review = await reviewService.approveReview(req.params.id, isApproved as ReviewStatus);
  const messages: Record<string, string> = {
    APPROVED: "Duyệt đánh giá thành công",
    REJECTED: "Từ chối đánh giá thành công",
    PENDING: "Đặt lại trạng thái chờ duyệt thành công",
  };
  res.json({ data: review, message: messages[isApproved] ?? "Cập nhật trạng thái thành công" });
};

export const bulkApproveReviewsHandler = async (req: Request, res: Response) => {
  const { reviewIds, isApproved } = req.body;
  await reviewService.bulkApproveReviews(reviewIds, isApproved as ReviewStatus);
  res.json({ message: "Cập nhật trạng thái đánh giá thành công" });
};

export const deleteReviewAdminHandler = async (req: Request, res: Response) => {
  await reviewService.softDeleteReview(req.params.id, req.user!.id);
  res.json({ message: "Xóa đánh giá thành công" });
};

export const bulkDeleteReviewsHandler = async (req: Request, res: Response) => {
  const { reviewIds } = req.body;
  await reviewService.bulkSoftDeleteReviews(reviewIds, req.user!.id);
  res.json({ message: "Xóa đánh giá thành công" });
};

export const restoreReviewHandler = async (req: Request, res: Response) => {
  const review = await reviewService.restoreReview(req.params.id);
  res.json({ data: review, message: "Khôi phục đánh giá thành công" });
};

export const bulkRestoreReviewsHandler = async (req: Request, res: Response) => {
  const { reviewIds } = req.body;
  await reviewService.bulkRestoreReviews(reviewIds);
  res.json({ message: "Khôi phục đánh giá thành công" });
};

export const hardDeleteReviewHandler = async (req: Request, res: Response) => {
  await reviewService.hardDeleteReview(req.params.id);
  res.json({ message: "Xóa vĩnh viễn đánh giá thành công" });
};

export const getDeletedReviewsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await reviewService.getDeletedReviews({ page, limit });
  res.json({
    data: result.data,
    pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách đánh giá đã xóa thành công",
  });
};
