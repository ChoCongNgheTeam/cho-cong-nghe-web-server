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

// "Đã xem gần đây" — dùng cho widget ở sidebar trang chủ (dưới danh mục)
export const recentlyViewedQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(20).default(4).optional(),
  sessionId: z.string().optional(),
  excludeProductId: z.string().uuid().optional(), // loại trừ SP đang xem — dùng khi đặt widget này ở trang chi tiết SP sau này
});

export type RecentlyViewedQuery = z.infer<typeof recentlyViewedQuerySchema>;

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

// Admin — thống kê hiệu suất gợi ý (CTR theo thuật toán + xu hướng theo ngày)
export const recommendationAnalyticsQuerySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30).optional(),
});

export type RecommendationAnalyticsQuery = z.infer<typeof recommendationAnalyticsQuerySchema>;
