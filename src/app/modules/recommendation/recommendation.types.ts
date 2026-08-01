// Lưu ý: cột `algorithm` trong recommendation_events là String tự do (không phải enum
// Postgres) nên có thể mở rộng thêm giá trị mới (VD: CATEGORY_MATCH) mà không cần migration.
export type RecommendationAlgorithm = "VECTOR_SIMILAR" | "BOUGHT_TOGETHER" | "CATEGORY_MATCH" | "TRENDING" | "FALLBACK";

// Card gọn để FE render danh sách gợi ý — không kéo theo toàn bộ pricing/promotion
// engine để giữ module recommendation độc lập với các module khác (xem plan §4.2).
export interface RecommendedProductCard {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  priceMin: number;
  priceMax: number;
  ratingAverage: number;
  totalSoldCount: number;
  isFeatured: boolean;
  /** Nguồn gợi ý — chỉ có ở "Có thể bạn thích" (list trộn nhiều thuật toán), không có ở "Sản phẩm tương tự". */
  algorithm?: RecommendationAlgorithm;
}

export interface RecommendationResult {
  algorithm: RecommendationAlgorithm;
  products: RecommendedProductCard[];
}
