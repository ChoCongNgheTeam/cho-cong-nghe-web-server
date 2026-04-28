import * as repo from "./review.repository";
import { CreateReviewInput, UpdateReviewAdminInput, ListReviewsQuery } from "./review.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import { ReviewStatus } from "@prisma/client";
import prisma from "@/config/db";
import { moderateContent } from "@/services/moderation";
import { sendReviewNewAdminNotification } from "@/app/modules/notification/notification.service";
import { isSettingEnabled } from "../settings/settings.service";

// ── Helper ─────────────────────────────────────────────────────────────────

const assertReviewExists = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const review = await repo.findReviewById(id, options);
  if (!review) throw new NotFoundError("Đánh giá");
  return review;
};

/**
 * Tính lại ratingAverage và ratingCount cho sản phẩm.
 * Gọi sau mỗi lần approve/reject/delete review để giữ số liệu đồng bộ.
 */
const recalculateProductRating = async (productId: string) => {
  const approvedReviews = await prisma.reviews.findMany({
    where: {
      deletedAt: null,
      isApproved: ReviewStatus.APPROVED,
      orderItem: { productVariant: { productId } },
    },
    select: { rating: true },
  });

  const ratingCount = approvedReviews.length;
  const ratingAverage = ratingCount > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;

  await prisma.products.update({
    where: { id: productId },
    data: {
      ratingCount,
      ratingAverage: parseFloat(ratingAverage.toFixed(2)),
    },
  });
};

const getProductIdFromReview = async (reviewId: string): Promise<string | null> => {
  const review = await prisma.reviews.findFirst({
    where: { id: reviewId },
    select: {
      orderItem: {
        select: { productVariant: { select: { productId: true } } },
      },
    },
  });
  return review?.orderItem.productVariant.productId ?? null;
};

// ── User ───────────────────────────────────────────────────────────────────

export const createUserReview = async (userId: string, input: CreateReviewInput) => {
  const { orderItemId, rating, comment } = input;

  if (!(await isSettingEnabled("ecommerce", "enable_product_review"))) {
    throw new BadRequestError("Chức năng đánh giá sản phẩm hiện đang tắt");
  }

  // 1. Validate order item
  const orderItem = await prisma.order_items.findUnique({
    where: { id: orderItemId },
    include: {
      order: { select: { userId: true, orderStatus: true } },
      productVariant: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  });

  if (!orderItem) throw new NotFoundError("Order item");
  if (orderItem.order.userId !== userId) throw new BadRequestError("Bạn không có quyền đánh giá sản phẩm này");
  if (orderItem.order.orderStatus !== "DELIVERED") throw new BadRequestError("Chỉ được đánh giá sau khi đơn hàng đã giao thành công");

  const existingReview = await repo.findReviewByOrderItemId(orderItemId);
  if (existingReview) throw new BadRequestError("Bạn đã đánh giá sản phẩm này rồi");

  // Lấy thông tin product ngay tại đây để dùng cho notification
  const productId = orderItem.productVariant.product.id;
  const productName = orderItem.productVariant.product.name;

  // 2. Lưu DB với PENDING
  const review = await repo.createReview({ userId, orderItemId, rating, comment });

  // 3. Helper nội bộ: approve + recalculate + notify admin
  const approveAndNotify = async (reviewId: string) => {
    await repo.updateReview(reviewId, { isApproved: ReviewStatus.APPROVED });
    await recalculateProductRating(productId);

    // Notify admin/staff — fire-and-forget
    setImmediate(async () => {
      try {
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { fullName: true },
        });
        await sendReviewNewAdminNotification(user?.fullName ?? "Khách hàng", productName, rating, reviewId, productId);
      } catch (err) {
        console.error("[Notification] Lỗi gửi notify review mới:", err);
      }
    });
  };

  // 4. AI moderation nếu có comment
  if (comment) {
    try {
      const moderation = await moderateContent("review", comment);
      if (moderation.approved) {
        await approveAndNotify(review.id);
        return { review: await repo.findReviewById(review.id), autoApproved: true };
      } else {
        // Giữ PENDING, admin review sau — vẫn notify để admin biết có review mới cần duyệt
        setImmediate(async () => {
          try {
            const user = await prisma.users.findUnique({
              where: { id: userId },
              select: { fullName: true },
            });
            await sendReviewNewAdminNotification(user?.fullName ?? "Khách hàng", productName, rating, review.id, productId);
          } catch (err) {
            console.error("[Notification] Lỗi gửi notify review mới:", err);
          }
        });
        return { review, autoApproved: false, reason: moderation.reason };
      }
    } catch {
      // AI fail → giữ PENDING, vẫn notify admin
      setImmediate(async () => {
        try {
          const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { fullName: true },
          });
          await sendReviewNewAdminNotification(user?.fullName ?? "Khách hàng", productName, rating, review.id, productId);
        } catch (err) {
          console.error("[Notification] Lỗi gửi notify review mới:", err);
        }
      });
      return { review, autoApproved: false };
    }
  }

  // 5. Không có comment → auto approve ngay
  await approveAndNotify(review.id);
  return { review: await repo.findReviewById(review.id), autoApproved: true };
};

// ── Public ─────────────────────────────────────────────────────────────────

export const getReviewsByProduct = async (productId: string) => {
  const reviews = await repo.findReviewsByProductId(productId, true);

  const total = reviews.length;
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  }

  return {
    reviews,
    stats: {
      average: parseFloat(average.toFixed(2)),
      total,
      distribution,
    },
  };
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
  const updated = await repo.updateReview(reviewId, input);
  if (input.isApproved !== undefined) {
    const productId = await getProductIdFromReview(reviewId);
    if (productId) await recalculateProductRating(productId);
  }
  return updated;
};

export const approveReview = async (reviewId: string, isApproved: ReviewStatus) => {
  await assertReviewExists(reviewId);
  const updated = await repo.updateReview(reviewId, { isApproved });
  const productId = await getProductIdFromReview(reviewId);
  if (productId) await recalculateProductRating(productId);
  return updated;
};

export const bulkApproveReviews = async (reviewIds: string[], isApproved: ReviewStatus) => {
  const result = await repo.bulkApprove(reviewIds, isApproved);

  const productIds = await prisma.reviews.findMany({
    where: { id: { in: reviewIds } },
    select: { orderItem: { select: { productVariant: { select: { productId: true } } } } },
  });
  const uniqueProductIds = [...new Set(productIds.map((r) => r.orderItem.productVariant.productId))];
  await Promise.all(uniqueProductIds.map(recalculateProductRating));

  return result;
};

export const softDeleteReview = async (id: string, deletedById: string) => {
  await assertReviewExists(id);
  const result = await repo.softDelete(id, deletedById);
  const productId = await getProductIdFromReview(id);
  if (productId) await recalculateProductRating(productId);
  return result;
};

export const bulkSoftDeleteReviews = async (ids: string[], deletedById: string) => {
  const productIds = await prisma.reviews.findMany({
    where: { id: { in: ids } },
    select: { orderItem: { select: { productVariant: { select: { productId: true } } } } },
  });
  const uniqueProductIds = [...new Set(productIds.map((r) => r.orderItem.productVariant.productId))];

  const result = await repo.bulkSoftDelete(ids, deletedById);
  await Promise.all(uniqueProductIds.map(recalculateProductRating));
  return result;
};

export const restoreReview = async (id: string) => {
  const review = await repo.findReviewById(id, { includeDeleted: true });
  if (!review) throw new NotFoundError("Đánh giá");
  if (!(review as any).deletedAt) throw new BadRequestError("Đánh giá này chưa bị xóa");
  const restored = await repo.restore(id);
  const productId = await getProductIdFromReview(id);
  if (productId) await recalculateProductRating(productId);
  return restored;
};

export const bulkRestoreReviews = async (ids: string[]) => {
  const productIds = await prisma.reviews.findMany({
    where: { id: { in: ids } },
    select: { orderItem: { select: { productVariant: { select: { productId: true } } } } },
  });
  const uniqueProductIds = [...new Set(productIds.map((r) => r.orderItem.productVariant.productId))];

  const result = await repo.bulkRestore(ids);
  await Promise.all(uniqueProductIds.map(recalculateProductRating));
  return result;
};

export const hardDeleteReview = async (id: string) => {
  const review = await repo.findReviewById(id, { includeDeleted: true });
  if (!review) throw new NotFoundError("Đánh giá");
  if (!(review as any).deletedAt) throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn");
  const productId = await getProductIdFromReview(id);
  await repo.hardDelete(id);
  if (productId) await recalculateProductRating(productId);
};

export const getDeletedReviews = async (query: Pick<ListReviewsQuery, "page" | "limit">) => {
  return repo.findAllDeleted(query);
};
