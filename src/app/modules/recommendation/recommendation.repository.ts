import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { RecommendedProductCard, RecommendationAlgorithm } from "./recommendation.types";

// ============================================================
// Select dùng chung để build RecommendedProductCard — chỉ lấy field cần thiết,
// KHÔNG kéo theo pricing/promotion engine (xem lý do tách biệt ở plan §4.2).
// ============================================================

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  isFeatured: true,
  totalSoldCount: true,
  ratingAverage: true,
  img: { select: { imageUrl: true }, orderBy: { position: "asc" as const }, take: 1 },
  variants: { where: { isActive: true, deletedAt: null }, select: { price: true } },
} satisfies Prisma.productsSelect;

type ProductWithCardShape = Prisma.productsGetPayload<{ select: typeof cardSelect }>;

const toCard = (product: ProductWithCardShape): RecommendedProductCard => {
  const prices = product.variants.map((v) => Number(v.price));
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    thumbnail: product.img[0]?.imageUrl ?? null,
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    ratingAverage: Number(product.ratingAverage),
    totalSoldCount: product.totalSoldCount,
    isFeatured: product.isFeatured,
  };
};

/** Lấy danh sách card theo đúng thứ tự productIds truyền vào (thứ tự = độ liên quan). */
const findCardsByIdsOrdered = async (productIds: string[]): Promise<RecommendedProductCard[]> => {
  if (productIds.length === 0) return [];

  const products = await prisma.products.findMany({
    where: { id: { in: productIds }, isActive: true, deletedAt: null },
    select: cardSelect,
  });

  const byId = new Map(products.map((p) => [p.id, toCard(p)]));
  return productIds.map((id) => byId.get(id)).filter((c): c is RecommendedProductCard => !!c);
};

/**
 * "Sản phẩm tương tự" — vector similarity trên products_vector có sẵn (đọc §2.2 trong plan).
 * Không tự sinh embedding, chỉ ORDER BY embedding <-> embedding của sản phẩm gốc.
 */
export const findSimilarProductIds = async (productId: string, limit: number): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM products_vector pv
    JOIN products p ON p.id = pv."productId"
    WHERE pv."productId" != ${productId}::uuid
      AND p."deletedAt" IS NULL
      AND p."isActive" = true
      AND EXISTS (SELECT 1 FROM products_vector self WHERE self."productId" = ${productId}::uuid)
    ORDER BY pv.embedding <-> (SELECT embedding FROM products_vector WHERE "productId" = ${productId}::uuid)
    LIMIT ${limit}
  `;
  return rows.map((r) => r.id);
};

export const findSimilarProducts = async (productId: string, limit: number) => {
  const ids = await findSimilarProductIds(productId, limit);
  return findCardsByIdsOrdered(ids);
};

/**
 * "Khách mua X cũng mua Y" — self-join order_items theo cùng orderId.
 * Chỉ tính đơn KHÔNG bị huỷ để tránh nhiễu tín hiệu.
 */
export const findBoughtTogetherProductIds = async (productId: string, limit: number): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p2.id, COUNT(*) as cnt
    FROM order_items oi1
    JOIN products_variants pv1 ON pv1.id = oi1."productVariantId"
    JOIN order_items oi2 ON oi2."orderId" = oi1."orderId" AND oi2.id != oi1.id
    JOIN products_variants pv2 ON pv2.id = oi2."productVariantId"
    JOIN products p2 ON p2.id = pv2."productId"
    JOIN orders o ON o.id = oi1."orderId"
    WHERE pv1."productId" = ${productId}::uuid
      AND p2.id != ${productId}::uuid
      AND p2."deletedAt" IS NULL
      AND p2."isActive" = true
      AND o."orderStatus" != 'CANCELLED'
    GROUP BY p2.id
    ORDER BY cnt DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => r.id);
};

export const findBoughtTogetherProducts = async (productId: string, limit: number) => {
  const ids = await findBoughtTogetherProductIds(productId, limit);
  return findCardsByIdsOrdered(ids);
};

/** ID sản phẩm user đã từng mua (đơn không bị huỷ) — dùng để loại trừ khỏi gợi ý "chưa mua". */
export const findPurchasedProductIds = async (userId: string): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT DISTINCT p.id
    FROM order_items oi
    JOIN products_variants pv ON pv.id = oi."productVariantId"
    JOIN products p ON p.id = pv."productId"
    JOIN orders o ON o.id = oi."orderId"
    WHERE o."userId" = ${userId}::uuid AND o."orderStatus" != 'CANCELLED'
  `;
  return rows.map((r) => r.id);
};

/** Danh mục sản phẩm user đã từng mua — dùng làm tín hiệu "gợi ý cùng nhóm chưa mua". */
export const findPurchasedCategoryIds = async (userId: string): Promise<string[]> => {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT DISTINCT p."categoryId" as id
    FROM order_items oi
    JOIN products_variants pv ON pv.id = oi."productVariantId"
    JOIN products p ON p.id = pv."productId"
    JOIN orders o ON o.id = oi."orderId"
    WHERE o."userId" = ${userId}::uuid AND o."orderStatus" != 'CANCELLED'
  `;
  return rows.map((r) => r.id);
};

/** Sản phẩm user đang quan tâm nhưng chưa mua: wishlist + cart_items. */
export const findInterestProductIds = async (userId: string): Promise<string[]> => {
  const [wishlistRows, cartRows] = await Promise.all([
    prisma.wishlist.findMany({ where: { userId }, select: { productId: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.cart_items.findMany({
      where: { userId },
      select: { productVariant: { select: { productId: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const ids = [...wishlistRows.map((w) => w.productId), ...cartRows.map((c) => c.productVariant.productId)];
  return [...new Set(ids)];
};

/** Sản phẩm cùng danh mục, chưa mua, xếp theo bán chạy — dùng cho "gợi ý cùng nhóm chưa mua". */
export const findProductsByCategoriesExcluding = async (categoryIds: string[], excludeProductIds: string[], limit: number) => {
  if (categoryIds.length === 0) return [];

  const products = await prisma.products.findMany({
    where: {
      categoryId: { in: categoryIds },
      id: { notIn: excludeProductIds },
      isActive: true,
      deletedAt: null,
    },
    select: cardSelect,
    orderBy: [{ totalSoldCount: "desc" }],
    take: limit,
  });

  return products.map(toCard);
};

/** Fallback khi chưa có tín hiệu cá nhân hoá: sản phẩm bán chạy / nổi bật. */
export const findTrendingProducts = async (excludeProductIds: string[], limit: number) => {
  const products = await prisma.products.findMany({
    where: { id: { notIn: excludeProductIds }, isActive: true, deletedAt: null },
    select: cardSelect,
    orderBy: [{ isFeatured: "desc" }, { totalSoldCount: "desc" }],
    take: limit,
  });

  return products.map(toCard);
};

/** Sản phẩm được xem gần nhất (theo user hoặc theo session của khách chưa đăng nhập). */
export const findRecentlyViewedProductId = async (userId?: string, sessionId?: string): Promise<string | null> => {
  if (!userId && !sessionId) return null;

  const event = await prisma.product_view_events.findFirst({
    where: userId ? { userId } : { sessionId },
    orderBy: { createdAt: "desc" },
    select: { productId: true },
  });

  return event?.productId ?? null;
};

/**
 * Danh sách (nhiều) sản phẩm đã xem gần đây, không trùng lặp — dùng cho widget
 * "Đã xem gần đây" (khác với findRecentlyViewedProductId ở trên chỉ lấy ĐÚNG 1
 * sản phẩm làm seed cho vector similarity trong getForYou).
 */
export const findRecentlyViewedProductIds = async (params: { userId?: string; sessionId?: string; limit: number; excludeProductId?: string }): Promise<string[]> => {
  const { userId, sessionId, limit, excludeProductId } = params;
  if (!userId && !sessionId) return [];

  const events = await prisma.product_view_events.findMany({
    where: {
      ...(userId ? { userId } : { sessionId }),
      ...(excludeProductId && { productId: { not: excludeProductId } }),
    },
    distinct: ["productId"],
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { productId: true },
  });

  return events.map((e) => e.productId);
};

export const recordViewEvent = (data: { userId?: string; sessionId?: string; productId: string; source?: string }) =>
  prisma.product_view_events.create({ data });

export const recordRecommendationShown = (data: {
  userId?: string;
  sessionId?: string;
  productId: string;
  algorithm: RecommendationAlgorithm;
}) => prisma.recommendation_events.create({ data });

export const markRecommendationClicked = (productId: string, algorithm: RecommendationAlgorithm, userId?: string) =>
  prisma.recommendation_events.updateMany({
    where: { productId, algorithm, ...(userId && { userId }), wasClicked: false },
    data: { wasClicked: true, clickedAt: new Date() },
  });

// ============================================================
// Admin analytics — CTR (click-through rate) theo thuật toán + xu hướng theo
// ngày. Dùng raw SQL vì cần COUNT(*) FILTER (đếm shown và clicked cùng lúc
// trong 1 query) — Prisma groupBy không hỗ trợ điều kiện lọc trong aggregate.
// ============================================================

export interface AlgorithmStatsRow {
  algorithm: string;
  shown: bigint;
  clicked: bigint;
}

export interface DailyStatsRow {
  date: string;
  shown: bigint;
  clicked: bigint;
}

export const getAlgorithmStats = (since: Date) =>
  prisma.$queryRaw<AlgorithmStatsRow[]>`
    SELECT algorithm,
           COUNT(*) as shown,
           COUNT(*) FILTER (WHERE "wasClicked" = true) as clicked
    FROM recommendation_events
    WHERE "shownAt" >= ${since}
    GROUP BY algorithm
    ORDER BY shown DESC
  `;

export const getDailyStats = (since: Date) =>
  prisma.$queryRaw<DailyStatsRow[]>`
    SELECT to_char(date_trunc('day', "shownAt"), 'YYYY-MM-DD') as date,
           COUNT(*) as shown,
           COUNT(*) FILTER (WHERE "wasClicked" = true) as clicked
    FROM recommendation_events
    WHERE "shownAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `;
