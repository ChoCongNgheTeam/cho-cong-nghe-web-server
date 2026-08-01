import { z } from "zod";

export const similarProductsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(20).default(8).optional(),
});

export type SimilarProductsQuery = z.infer<typeof similarProductsQuerySchema>;

export const forYouQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(40).default(12).optional(),
  sessionId: z.string().optional(), // dùng cho khách chưa đăng nhập, FE tự sinh & lưu ở localStorage
});

export type ForYouQuery = z.infer<typeof forYouQuerySchema>;

export const trackViewEventSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ"),
  sessionId: z.string().optional(),
  source: z.enum(["HOME", "DETAIL", "SEARCH"]).optional(),
});

export type TrackViewEventInput = z.infer<typeof trackViewEventSchema>;

export const trackRecommendationClickSchema = z.object({
  productId: z.string().uuid(),
  algorithm: z.enum(["VECTOR_SIMILAR", "BOUGHT_TOGETHER", "CATEGORY_MATCH", "TRENDING", "FALLBACK"]),
});

export type TrackRecommendationClickInput = z.infer<typeof trackRecommendationClickSchema>;
