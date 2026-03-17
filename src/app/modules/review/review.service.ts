import * as repo from "./review.repository";
import { moderateReview } from "./review.moderation";
import { CreateReviewInput, UpdateReviewAdminInput, ListReviewsQuery } from "./review.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import { ReviewStatus } from "@prisma/client";
import prisma from "@/config/db";

// ── Helper ─────────────────────────────────────────────────────────────────

const assertReviewExists = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const review = await repo.findReviewById(id, options);
  if (!review) throw new NotFoundError("Đánh giá");
  return review;
};

// ── User ───────────────────────────────────────────────────────────────────

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

  const existingReview = await repo.findReviewByOrderItemId(orderItemId);
  if (existingReview) throw new BadRequestError("Bạn đã đánh giá sản phẩm này rồi");

  // Lưu DB trước với PENDING
  const review = await repo.createReview({ userId, orderItemId, rating, comment });

  // AI moderation nếu có comment
  if (comment) {
    try {
      const moderation = await moderateReview(comment);
      if (moderation.approved) {
        await repo.updateReview(review.id, { isApproved: ReviewStatus.APPROVED });
        return { review: await repo.findReviewById(review.id), autoApproved: true };
      } else {
        return { review, autoApproved: false, reason: moderation.reason };
      }
    } catch {
      // AI fail → giữ PENDING, admin review sau
      return { review, autoApproved: false };
    }
  }

  // Không có comment → auto approve luôn (chỉ có rating)
  await repo.updateReview(review.id, { isApproved: ReviewStatus.APPROVED });
  return { review: await repo.findReviewById(review.id), autoApproved: true };
};

// ── Public ─────────────────────────────────────────────────────────────────

export const getReviewsByProduct = async (productId: string) => {
  return repo.findReviewsByProductId(productId, true);
};

// ── Admin ──────────────────────────────────────────────────────────────────

export const getAllReviewsAdmin = async (query: ListReviewsQuery) => {
  return repo.findAllReviewsAdmin(query);
};

export const getReviewById = async (id: string) => {
  return assertReviewExists(id);
};

export const updateReviewAdmin = async (reviewId: string, input: UpdateReviewAdminInput) => {
  await assertReviewExists(reviewId);
  return repo.updateReview(reviewId, input);
};

export const approveReview = async (reviewId: string, isApproved: ReviewStatus) => {
  await assertReviewExists(reviewId);
  return repo.updateReview(reviewId, { isApproved });
};

export const bulkApproveReviews = async (reviewIds: string[], isApproved: ReviewStatus) => {
  return repo.bulkApprove(reviewIds, isApproved);
};

export const softDeleteReview = async (id: string, deletedById: string) => {
  await assertReviewExists(id);
  return repo.softDelete(id, deletedById);
};

export const bulkSoftDeleteReviews = async (ids: string[], deletedById: string) => {
  return repo.bulkSoftDelete(ids, deletedById);
};

export const restoreReview = async (id: string) => {
  const review = await repo.findReviewById(id, { includeDeleted: true });
  if (!review) throw new NotFoundError("Đánh giá");
  if (!(review as any).deletedAt) throw new BadRequestError("Đánh giá này chưa bị xóa");
  return repo.restore(id);
};

export const bulkRestoreReviews = async (ids: string[]) => {
  return repo.bulkRestore(ids);
};

export const hardDeleteReview = async (id: string) => {
  const review = await repo.findReviewById(id, { includeDeleted: true });
  if (!review) throw new NotFoundError("Đánh giá");
  if (!(review as any).deletedAt) {
    throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn");
  }
  return repo.hardDelete(id);
};

export const getDeletedReviews = async (query: Pick<ListReviewsQuery, "page" | "limit">) => {
  return repo.findAllDeleted(query);
};
