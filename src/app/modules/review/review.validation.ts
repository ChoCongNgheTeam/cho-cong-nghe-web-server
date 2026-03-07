import { z } from "zod";

export const createReviewSchema = z.object({
  orderItemId: z.uuid("ID order item không hợp lệ"),
  rating: z
    .number()
    .int("Rating phải là số nguyên")
    .min(1, "Đánh giá phải từ 1 đến 5 sao")
    .max(5, "Đánh giá phải từ 1 đến 5 sao"),
  comment: z.string().optional(),
});

export const updateReviewAdminSchema = z
  .object({
    isApproved: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewAdminInput = z.infer<typeof updateReviewAdminSchema>;
