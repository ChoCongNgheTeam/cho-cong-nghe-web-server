/**
 * search.service.ts  (v5)
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
 *   Tier 0: tên bắt đầu bằng keyword (iPhone > Ốp lưng iPhone)
 *   Tier 1: chỉ chứa keyword ở giữa
 *   (DB orderBy đã lo isFeatured / totalSoldCount / ratingAverage / createdAt trước đó)
 *
 * PAGINATION
 * ──────────
 * Không dùng `skip` ở DB cho các pool cần re-sort ở app-layer (Strategy A, Strategy B
 * single-brand, Strategy B multi-brand round-robin) — vì relevanceSort chỉ có ý nghĩa
 * đúng khi thực hiện trên TOÀN BỘ pool từ đầu, không phải trên từng window `skip/take`
 * riêng lẻ (window riêng → tier bị phân bổ lệch giữa các trang, gây trùng/lệch thứ tự
 * khi qua trang 2+). Thay vào đó: luôn fetch pool từ đầu tới hết trang hiện tại
 * (`take = page * limit * multiplier`), sort 1 lần trên pool đó, rồi mới `slice`
 * đúng window của trang cần trả về. Đánh đổi: query pool tăng dần theo số trang
 * (chấp nhận được vì search hiếm khi lật sâu nhiều trang).
 */

import * as repo from "./search.repository";
import { ProductCardRow } from "./search.repository";
import { buildKeywordVariants, isWordIntent, normalizeVietnamese } from "./search.helpers";
import { SearchQuery } from "./search.validation";
import { Prisma } from "@prisma/client";

// =====================
// === SEARCH INTENT ===
// =====================

export interface SearchIntent {
  categoryIds: string[];
  brandIds: string[];
  /**
   * true = keyword thực sự match TÊN category/brand theo word-boundary
   * false = chỉ match slug substring hoặc keyword quá ngắn
   */
  hasStrongIntent: boolean;
}

const buildNameOrConditions = (variants: string[]) => variants.map((v) => ({ name: { contains: v, mode: "insensitive" as const } }));
const buildNameOrSlugConditions = (variants: string[]) => variants.flatMap((v) => [{ name: { contains: v, mode: "insensitive" as const } }, { slug: { contains: v, mode: "insensitive" as const } }]);

export const resolveSearchIntent = async (q: string): Promise<SearchIntent> => {
  const variants = buildKeywordVariants(q);

  const nameOnlyConditions = buildNameOrConditions(variants);
  const nameOrSlugConditions = buildNameOrSlugConditions(variants);

  const [nameMatchedCats, allMatchedCats, nameMatchedBrands, allMatchedBrands] = await Promise.all([
    repo.findCategoriesByName(nameOnlyConditions),
    repo.findCategoriesByNameOrSlug(nameOrSlugConditions),
    repo.findBrandsByName(nameOnlyConditions),
    repo.findBrandsByNameOrSlug(nameOrSlugConditions),
  ]);

  // Gộp lookup descendant thành 1 query CTE cho TẤT CẢ root category id (thay vì loop N query).
  const categoryIds = await repo.findCategoryDescendantIds(allMatchedCats.map((c) => c.id));

  const hasCatIntent = nameMatchedCats.some((cat) => variants.some((v) => isWordIntent(v, cat.name)));
  const hasBrandIntent = nameMatchedBrands.some((brand) => variants.some((v) => isWordIntent(v, brand.name)));

  return {
    categoryIds: [...new Set(categoryIds)],
    brandIds: allMatchedBrands.map((b) => b.id),
    hasStrongIntent: hasCatIntent || hasBrandIntent,
  };
};

// =====================
// === RELEVANCE SORT ===
// =====================

const relevanceSort = (products: ProductCardRow[], q: string): ProductCardRow[] => {
  const qNorm = normalizeVietnamese(q);

  return [...products].sort((a, b) => {
    const aNorm = normalizeVietnamese(a.name ?? "");
    const bNorm = normalizeVietnamese(b.name ?? "");

    const aTier = aNorm.startsWith(qNorm) ? 0 : 1;
    const bTier = bNorm.startsWith(qNorm) ? 0 : 1;

    return aTier - bTier; // stable sort giữ nguyên thứ tự trong cùng tier
  });
};

// Fetch pool từ đầu (không skip) tới hết trang hiện tại, sort 1 lần, rồi slice đúng window trang.
const paginateWithRelevanceSort = async (scopeWhere: Prisma.productsWhereInput, q: string, page: number, limit: number, poolMultiplier: number): Promise<ProductCardRow[]> => {
  const poolSize = page * limit * poolMultiplier;
  const pool = await repo.findProductPool(scopeWhere, poolSize);
  const sorted = relevanceSort(pool, q);
  return sorted.slice((page - 1) * limit, page * limit);
};

// =====================
// === SEARCH PRODUCTS ===
// =====================

export const searchProducts = async (query: SearchQuery) => {
  const { q, page, limit } = query;
  const variants = buildKeywordVariants(q);

  // Step 1: Resolve intent
  const { categoryIds, brandIds, hasStrongIntent } = await resolveSearchIntent(q);

  // Step 2: Build scopeWhere
  const orConditions: Prisma.productsWhereInput[] = buildNameOrConditions(variants);
  if (categoryIds.length > 0) orConditions.push({ categoryId: { in: categoryIds } });
  if (brandIds.length > 0) orConditions.push({ brandId: { in: brandIds } });

  const scopeWhere: Prisma.productsWhereInput = { isActive: true, deletedAt: null, OR: orConditions };

  // Step 3: Count
  const total = await repo.countProducts(scopeWhere);
  if (total === 0) {
    return { data: [] as ProductCardRow[], total: 0, page, limit, totalPages: 0 };
  }

  let results: ProductCardRow[];

  if (!hasStrongIntent) {
    // STRATEGY A: Name-prefix search ("ip", "sam", "gal s25"...)
    results = await paginateWithRelevanceSort(scopeWhere, q, page, limit, 3);
  } else {
    const distinctBrandIds = await repo.findDistinctBrandIds(scopeWhere);

    if (distinctBrandIds.length <= 1) {
      // Single-brand: "iphone" → chỉ Apple
      results = await paginateWithRelevanceSort(scopeWhere, q, page, limit, 2);
    } else {
      // Multi-brand: "điện thoại", "samsung"... — round-robin interleave theo brand.
      // Lấy mỗi brand tới `page * limit` item (không chỉ `limit`) để round-robin đủ dữ liệu
      // dựng lại toàn bộ danh sách từ đầu, sau đó mới slice đúng window của trang hiện tại
      // (tránh bug trang 2+ luôn giống hệt trang 1 do trước đây không tính theo page).
      const perBrandPoolSize = page * limit;
      const perBrandResults = await Promise.all(distinctBrandIds.map((brandId) => repo.findProductsByBrand(scopeWhere, brandId, perBrandPoolSize)));

      const queues = perBrandResults.map((items) => relevanceSort(items, q));

      const combined: ProductCardRow[] = [];
      const targetSize = page * limit;
      let idx = 0;
      while (combined.length < targetSize) {
        const anyLeft = queues.some((qu) => qu.length > 0);
        if (!anyLeft) break;
        const queue = queues[idx % queues.length];
        if (queue.length > 0) combined.push(queue.shift()!);
        idx++;
      }

      results = combined.slice((page - 1) * limit, page * limit);
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
