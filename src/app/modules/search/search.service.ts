/**
 * search.service.ts  (v4)
 *
 * STRATEGY DESIGN
 * ───────────────
 *  A) STRATEGY_NAME_PREFIX (hasStrongIntent = false)
 *     → keyword không match TÊN category/brand ("ip", "sam", "gal")
 *     → Strategy A: lấy pool rộng + prefix boost sort
 *
 *  B) STRATEGY_CATEGORY_BRAND (hasStrongIntent = true)
 *     → keyword match TÊN category/brand ("iphone", "samsung", "điện thoại")
 *     → Strategy B: interleave by brand (multi-brand) hoặc top-N (single-brand)
 *     → Sau đó vẫn apply relevance sort để sản phẩm chính lên trước phụ kiện/test
 *
 * RELEVANCE SORT (áp dụng cả 2 strategy):
 *   Tier 1: tên bắt đầu bằng keyword (iPhone > Ốp lưng iPhone)
 *   Tier 2: isFeatured
 *   Tier 3: totalSoldCount
 *   Tier 4: createdAt desc (mới nhất lên trước)
 */

import prisma from "@/config/db";
import { selectProductCard } from "../product/product.repository";
import { buildKeywordVariants, buildSearchCategoryAndBrandIdsV2, normalizeVietnamese } from "./search.helpers";

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildNameOrConditions = (variants: string[]) =>
  variants.map((v) => ({
    name: { contains: v, mode: "insensitive" as const },
  }));

/**
 * Relevance sort — áp dụng sau khi fetch từ DB.
 *
 * Tier 0 (score 0): tên bắt đầu bằng keyword → sản phẩm chính
 * Tier 1 (score 1): tên chứa keyword ở giữa   → phụ kiện, accessories
 *
 * Trong cùng tier: giữ nguyên thứ tự DB (đã sort isFeatured + totalSoldCount).
 *
 * VD với q="iphone":
 *   Tier 0: "iPhone 17 Pro Max", "iPhone 16", "iPhone 13"...
 *   Tier 1: "Ốp lưng iPhone 15 Pro Max", "Iphone 17 vip pro" (chữ thường)
 */
const relevanceSort = (products: any[], q: string): any[] => {
  const qNorm = normalizeVietnamese(q);

  return [...products].sort((a, b) => {
    const aNorm = normalizeVietnamese(a.name ?? "");
    const bNorm = normalizeVietnamese(b.name ?? "");

    // Tier: 0 = prefix match, 1 = contains only
    const aTier = aNorm.startsWith(qNorm) ? 0 : 1;
    const bTier = bNorm.startsWith(qNorm) ? 0 : 1;

    return aTier - bTier; // stable sort giữ nguyên thứ tự trong cùng tier
  });
};

// ── searchProducts ────────────────────────────────────────────────────────────

export const searchProducts = async (q: string, page = 1, limit = 12) => {
  const variants = buildKeywordVariants(q);

  // ── Step 1: Resolve intent ──────────────────────────────────────────────────
  const { categoryIds, brandIds, hasStrongIntent } = await buildSearchCategoryAndBrandIdsV2(q, prisma as any);

  console.log("hasStrongIntent:", hasStrongIntent);
  console.log("categoryIds:", categoryIds);
  console.log("brandIds:", brandIds);

  // ── Step 2: Build scopeWhere ────────────────────────────────────────────────
  const orConditions: any[] = buildNameOrConditions(variants);

  if (categoryIds.length > 0) {
    orConditions.push({ categoryId: { in: categoryIds } });
  }
  if (brandIds.length > 0) {
    orConditions.push({ brandId: { in: brandIds } });
  }

  const scopeWhere = {
    isActive: true,
    deletedAt: null,
    OR: orConditions,
  };

  // ── Step 3: Count ───────────────────────────────────────────────────────────
  const total = await prisma.products.count({ where: scopeWhere });

  if (total === 0) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  // DB orderBy — áp dụng cho tất cả queries
  // relevanceSort ở app-layer sẽ làm tier phân loại prefix/contains
  const orderBy = [{ isFeatured: "desc" as const }, { totalSoldCount: "desc" as const }, { ratingAverage: "desc" as const }, { createdAt: "desc" as const }];

  let results: any[];

  if (!hasStrongIntent) {
    // ── STRATEGY A: Name-prefix search ─────────────────────────────────────
    // "ip", "sam", "gal s25"...
    // Lấy pool limit*3 để relevanceSort có đủ candidates
    const pool = await prisma.products.findMany({
      where: scopeWhere,
      select: selectProductCard,
      orderBy,
      take: limit * 3,
      skip: (page - 1) * limit,
    });

    results = relevanceSort(pool, q).slice(0, limit);
  } else {
    // ── STRATEGY B: Explicit category/brand intent ──────────────────────────
    const distinctBrands = await prisma.products.findMany({
      where: scopeWhere,
      select: { brandId: true },
      distinct: ["brandId"],
    });

    console.log("Strategy B - distinctBrands count:", distinctBrands.length);

    if (distinctBrands.length <= 1) {
      // Single-brand: "iphone" → chỉ Apple
      // Lấy pool rộng hơn để relevanceSort đẩy iPhone thật lên trước
      // phụ kiện iPhone và sản phẩm test
      const pool = await prisma.products.findMany({
        where: scopeWhere,
        select: selectProductCard,
        orderBy,
        take: limit * 2, // lấy dư để sort có ý nghĩa
        skip: (page - 1) * limit,
      });

      results = relevanceSort(pool, q).slice(0, limit);
    } else {
      // Multi-brand: "điện thoại", "samsung"...
      // Round-robin interleave, sau đó relevanceSort trong mỗi brand queue
      const perBrandResults = await Promise.all(
        distinctBrands.map(({ brandId }) =>
          prisma.products.findMany({
            where: { ...scopeWhere, brandId },
            select: selectProductCard,
            orderBy,
            take: limit,
          }),
        ),
      );

      // Relevance sort trong từng brand queue trước khi interleave
      const sortedQueues = perBrandResults.map((items) => relevanceSort(items, q));

      results = [];
      const queues = sortedQueues.map((items) => [...items]);
      let idx = 0;
      while (results.length < limit) {
        const anyLeft = queues.some((q) => q.length > 0);
        if (!anyLeft) break;
        const queue = queues[idx % queues.length];
        if (queue.length > 0) results.push(queue.shift()!);
        idx++;
      }
    }
  }

  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
