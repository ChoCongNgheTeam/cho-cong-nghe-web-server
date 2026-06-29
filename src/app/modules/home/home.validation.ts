import { z } from "zod";
import { HOME_SALE_BY_DATE_DEFAULT_LIMIT } from "./home.constants";

/**
 * Convention đặt tên schema toàn project:
 *   <httpMethod><Resource>Schema
 *
 * Zod v4: error message dùng `error` thay vì `required_error` / `invalid_type_error`
 * (breaking change từ Zod v3 → v4).
 */
export const getSaleByDateSchema = z.object({
  date: z.string({ error: "date là bắt buộc" }).regex(/^\d{4}-\d{2}-\d{2}$/, "date phải có định dạng YYYY-MM-DD"),

  promotionId: z.string().optional(),

  page: z.coerce.number({ error: "page phải là số nguyên" }).int().min(1).default(1),

  limit: z.coerce.number({ error: "limit phải là số nguyên" }).int().min(1).max(100).default(HOME_SALE_BY_DATE_DEFAULT_LIMIT),
});

export type GetSaleByDateQuery = z.infer<typeof getSaleByDateSchema>;
