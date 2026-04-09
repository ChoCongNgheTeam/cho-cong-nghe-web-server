// ============================================================
// ai.validation.ts
// Zod schemas — khớp pattern product.validation.ts
// ============================================================

import { z } from "zod";

/**
 * POST /api/ai/compare
 * Body: { productIds: ["uuid1", "uuid2"] }
 *
 * - Tối thiểu 2, tối đa 3 sản phẩm
 * - Mỗi item phải là UUID hợp lệ
 * - Không cho phép ID trùng
 */
export const aiCompareBodySchema = z.object({
  productIds: z
    .array(z.string().uuid("Mỗi productId phải là UUID hợp lệ"))
    .min(2, "Cần ít nhất 2 sản phẩm để so sánh")
    .max(3, "Tối đa 3 sản phẩm mỗi lần so sánh")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Danh sách productIds không được chứa ID trùng lặp"
    ),
});

export type AICompareBody = z.infer<typeof aiCompareBodySchema>;