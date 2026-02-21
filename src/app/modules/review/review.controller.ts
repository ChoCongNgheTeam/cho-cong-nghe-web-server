import { Request, Response } from "express";
import { createUserReview, getReviewsByProduct, getAllReviewsAdmin, updateReviewAdmin, deleteReviewAdmin } from "./review.service";

export const createReviewHandler = async (req: Request, res: Response) => {
  const review = await createUserReview(req.user!.id, req.body);
  res.status(201).json({
    data: review,
    message: "Tạo đánh giá thành công. Đánh giá sẽ hiển thị sau khi được duyệt.",
  });
};

export const getProductReviewsHandler = async (req: Request, res: Response) => {
  const reviews = await getReviewsByProduct(req.params.productId);
  res.json({ data: reviews, total: reviews.length, message: "Lấy danh sách đánh giá sản phẩm thành công" });
};

export const getAllReviewsAdminHandler = async (req: Request, res: Response) => {
  const reviews = await getAllReviewsAdmin();
  res.json({ data: reviews, total: reviews.length, message: "Lấy tất cả đánh giá thành công" });
};

export const updateReviewAdminHandler = async (req: Request, res: Response) => {
  const review = await updateReviewAdmin(req.params.id, req.body);
  res.json({ data: review, message: "Cập nhật đánh giá thành công" });
};

export const deleteReviewAdminHandler = async (req: Request, res: Response) => {
  await deleteReviewAdmin(req.params.id);
  res.json({ message: "Xóa đánh giá thành công" });
};
