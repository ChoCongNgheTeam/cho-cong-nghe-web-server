import { z } from "zod";

export const createReviewSchema = z.object({
  orderItemId: z.string().uuid("ID order item không hợp lệ"),
  rating: z.number().int("Rating phải là số nguyên").min(1, "Đánh giá phải từ 1 đến 5 sao").max(5, "Đánh giá phải từ 1 đến 5 sao"),
  comment: z.string().optional(),
});

export const updateReviewAdminSchema = z
  .object({
    isApproved: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    comment: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
  })
  .strict();

export const listReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isApproved: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  productId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeDeleted: z.coerce.boolean().optional().default(false),
});

export const reviewParamsSchema = z.object({
  id: z.string().uuid("ID đánh giá không hợp lệ"),
});

export const bulkApproveReviewSchema = z.object({
  reviewIds: z.array(z.string().uuid()).min(1, "Cần ít nhất 1 review ID"),
  isApproved: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const bulkDeleteReviewSchema = z.object({
  reviewIds: z.array(z.string().uuid()).min(1, "Cần ít nhất 1 review ID"),
});

export const bulkRestoreReviewSchema = z.object({
  reviewIds: z.array(z.string().uuid()).min(1, "Cần ít nhất 1 review ID"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewAdminInput = z.infer<typeof updateReviewAdminSchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsSchema>;
