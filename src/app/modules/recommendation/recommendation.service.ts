import * as repo from "./recommendation.repository";
import { RecommendedProductCard, RecommendationAlgorithm } from "./recommendation.types";

const SIMILAR_FALLBACK_MULTIPLIER = 2; // lấy dư ra để có gì đó hiển thị nếu vector similarity trả về ít

/** Ghi log "đã hiển thị" cho 1 danh sách sản phẩm — dùng chung cho similar/bought-together/for-you. Không chặn response nếu lỗi. */
const logShown = (products: { id: string }[], algorithm: RecommendationAlgorithm, userId?: string, sessionId?: string) => {
  Promise.all(products.map((p) => repo.recordRecommendationShown({ userId, sessionId, productId: p.id, algorithm }))).catch((err) =>
    console.error("[Recommendation] Lỗi ghi log recommendation_events:", err),
  );
};

/** "Sản phẩm tương tự" trên trang chi tiết — thuần vector similarity trên products_vector có sẵn. */
export const getSimilarProducts = async (productId: string, limit: number, userId?: string, sessionId?: string) => {
  let products = await repo.findSimilarProducts(productId, limit);

  // Vector similarity hụt (SP mới, chưa kịp đồng bộ embedding...) → fallback trending, loại trừ chính nó.
  if (products.length < limit) {
    const fallback = await repo.findTrendingProducts([productId, ...products.map((p) => p.id)], limit - products.length);
    products = [...products, ...fallback];
  }

  logShown(products, "VECTOR_SIMILAR", userId, sessionId);
  return { algorithm: "VECTOR_SIMILAR" as RecommendationAlgorithm, products };
};

/** "Khách mua X cũng mua Y" — dùng cho trang chi tiết SP hoặc trang giỏ hàng. */
export const getBoughtTogetherProducts = async (productId: string, limit: number, userId?: string, sessionId?: string) => {
  const products = await repo.findBoughtTogetherProducts(productId, limit);
  logShown(products, "BOUGHT_TOGETHER", userId, sessionId);
  return products;
};

type GetForYouParams = {
  userId?: string;
  sessionId?: string;
  limit: number;
};

/**
 * "Có thể bạn thích" — trộn nhiều tín hiệu theo thứ tự ưu tiên (waterfall), không trùng lặp SP:
 *  1. Đăng nhập + có món đang quan tâm (wishlist/cart) chưa mua → vector similar từ món đó
 *  2. Đăng nhập + có lịch sử mua → SP cùng danh mục đã mua, nhưng chưa mua
 *  3. Khách chưa đăng nhập nhưng có lượt xem gần đây (theo sessionId) → vector similar từ SP vừa xem
 *  4. Không có tín hiệu gì → SP bán chạy / nổi bật (trending)
 */
export const getForYou = async ({ userId, sessionId, limit }: GetForYouParams): Promise<{ products: RecommendedProductCard[] }> => {
  const excludeIds = new Set<string>();
  const result: RecommendedProductCard[] = [];

  const pushUnique = (items: RecommendedProductCard[], algorithm: RecommendationAlgorithm) => {
    for (const item of items) {
      if (result.length >= limit) break;
      if (excludeIds.has(item.id)) continue;
      result.push({ ...item, algorithm });
      excludeIds.add(item.id);
    }
  };

  if (userId) {
    const purchasedIds = await repo.findPurchasedProductIds(userId);
    purchasedIds.forEach((id) => excludeIds.add(id));

    const interestIds = (await repo.findInterestProductIds(userId)).filter((id) => !excludeIds.has(id));

    if (interestIds.length > 0 && result.length < limit) {
      const seedProductId = interestIds[0];
      const similar = await repo.findSimilarProducts(seedProductId, limit * SIMILAR_FALLBACK_MULTIPLIER);
      pushUnique(similar, "VECTOR_SIMILAR");
    }

    if (result.length < limit) {
      const categoryIds = await repo.findPurchasedCategoryIds(userId);
      const categoryProducts = await repo.findProductsByCategoriesExcluding(categoryIds, [...excludeIds], limit - result.length);
      pushUnique(categoryProducts, "CATEGORY_MATCH");
    }
  } else if (sessionId) {
    const recentProductId = await repo.findRecentlyViewedProductId(undefined, sessionId);
    if (recentProductId) {
      excludeIds.add(recentProductId);
      const similar = await repo.findSimilarProducts(recentProductId, limit * SIMILAR_FALLBACK_MULTIPLIER);
      pushUnique(similar, "VECTOR_SIMILAR");
    }
  }

  if (result.length < limit) {
    const trending = await repo.findTrendingProducts([...excludeIds], limit - result.length);
    pushUnique(trending, "TRENDING");
  }

  // Ghi log "đã hiển thị" để sau này tính CTR (không chặn response nếu lỗi).
  // Không dùng logShown() ở đây vì mỗi item có thể khác algorithm nhau (danh
  // sách trộn nhiều nguồn) — logShown chỉ hợp với 1 algorithm chung cho cả list.
  Promise.all(
    result.map((p) =>
      repo.recordRecommendationShown({
        userId,
        sessionId,
        productId: p.id,
        algorithm: p.algorithm as RecommendationAlgorithm,
      }),
    ),
  ).catch((err) => console.error("[Recommendation] Lỗi ghi log recommendation_events:", err));

  return { products: result };
};

export const trackViewEvent = (data: { userId?: string; sessionId?: string; productId: string; source?: string }) =>
  repo.recordViewEvent(data);

/** "Đã xem gần đây" — widget sidebar trang chủ. Không ghi log shown/click — đây là lịch sử, không phải "gợi ý" cần tính CTR. */
export const getRecentlyViewed = async (params: { userId?: string; sessionId?: string; limit: number; excludeProductId?: string }) =>
  repo.findRecentlyViewedProductIds(params);

export const trackRecommendationClick = (productId: string, algorithm: RecommendationAlgorithm, userId?: string) =>
  repo.markRecommendationClicked(productId, algorithm, userId);

// ============================================================
// Admin analytics
// ============================================================

interface AlgorithmStat {
  algorithm: string;
  shown: number;
  clicked: number;
  ctr: number; // %, làm tròn 1 chữ số thập phân
}

interface DailyStat {
  date: string;
  shown: number;
  clicked: number;
}

export interface RecommendationAnalytics {
  totalShown: number;
  totalClicked: number;
  ctr: number;
  byAlgorithm: AlgorithmStat[];
  daily: DailyStat[];
}

const toCtr = (shown: number, clicked: number) => (shown > 0 ? Math.round((clicked / shown) * 1000) / 10 : 0);

export const getAnalytics = async (days: number): Promise<RecommendationAnalytics> => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [algorithmRows, dailyRows] = await Promise.all([repo.getAlgorithmStats(since), repo.getDailyStats(since)]);

  const byAlgorithm: AlgorithmStat[] = algorithmRows.map((row) => {
    const shown = Number(row.shown);
    const clicked = Number(row.clicked);
    return { algorithm: row.algorithm, shown, clicked, ctr: toCtr(shown, clicked) };
  });

  const totalShown = byAlgorithm.reduce((sum, r) => sum + r.shown, 0);
  const totalClicked = byAlgorithm.reduce((sum, r) => sum + r.clicked, 0);

  const daily: DailyStat[] = dailyRows.map((row) => ({ date: row.date, shown: Number(row.shown), clicked: Number(row.clicked) }));

  return { totalShown, totalClicked, ctr: toCtr(totalShown, totalClicked), byAlgorithm, daily };
};
