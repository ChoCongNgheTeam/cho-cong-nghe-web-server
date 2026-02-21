import { findReviewByOrderItemId, findReviewsByProductId, findAllReviewsAdmin, findReviewById, createReview, updateReview, deleteReview } from "./review.repository";
import { CreateReviewInput, UpdateReviewAdminInput } from "./review.validation";
import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";

export const createUserReview = async (userId: string, input: CreateReviewInput) => {
  const { orderItemId, rating, comment } = input;

  const orderItem = await prisma.order_items.findUnique({
    where: { id: orderItemId },
    include: {
      order: { select: { userId: true, orderStatus: true } },
    },
  });

  if (!orderItem) throw new NotFoundError("Order item");

  if (orderItem.order.userId !== userId) {
    throw new BadRequestError("Bạn không có quyền đánh giá sản phẩm này");
  }

  if (orderItem.order.orderStatus !== "DELIVERED") {
    throw new BadRequestError("Chỉ được đánh giá sau khi đơn hàng đã giao thành công");
  }

  const existingReview = await findReviewByOrderItemId(orderItemId);
  if (existingReview) throw new BadRequestError("Bạn đã đánh giá sản phẩm này rồi");

  return createReview({ userId, orderItemId, rating, comment });
};

export const getReviewsByProduct = async (productId: string) => {
  return findReviewsByProductId(productId, true);
};

export const getAllReviewsAdmin = async () => {
  return findAllReviewsAdmin();
};

export const updateReviewAdmin = async (reviewId: string, input: UpdateReviewAdminInput) => {
  const review = await findReviewById(reviewId);
  if (!review) throw new NotFoundError("Đánh giá");
  return updateReview(reviewId, input);
};

export const deleteReviewAdmin = async (reviewId: string) => {
  const review = await findReviewById(reviewId);
  if (!review) throw new NotFoundError("Đánh giá");
  await deleteReview(reviewId);
};
