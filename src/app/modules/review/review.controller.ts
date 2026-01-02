import { Request, Response } from "express";
import {
  createUserReview,
  getReviewsByProduct,
  getAllReviewsAdmin,
  updateReviewAdmin,
  deleteReviewAdmin,
} from "./review.service";

export const createReviewHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const review = await createUserReview(userId, req.body);
  res.status(201).json({
    data: review,
    message: "Tạo đánh giá thành công. Đánh giá sẽ hiển thị sau khi được duyệt.",
  });
};

export const getProductReviewsHandler = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = await getReviewsByProduct(productId);
  res.json({
    data: reviews,
    total: reviews.length,
    message: "Lấy danh sách đánh giá sản phẩm thành công",
  });
};

// Admin
export const getAllReviewsAdminHandler = async (req: Request, res: Response) => {
  const reviews = await getAllReviewsAdmin();
  res.json({
    data: reviews,
    total: reviews.length,
    message: "Lấy tất cả đánh giá thành công",
  });
};

export const updateReviewAdminHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await updateReviewAdmin(id, req.body);
  res.json({
    data: review,
    message: "Cập nhật đánh giá thành công",
  });
};

export const deleteReviewAdminHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteReviewAdmin(id);
  res.json({ message: "Xóa đánh giá thành công" });
};
