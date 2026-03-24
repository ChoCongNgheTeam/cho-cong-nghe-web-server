import prisma from "@/config/db";
import { buildSearchCategoryAndBrandIds } from "../product/product_filter.where-builder";
import { selectProductCard } from "../product/product.repository";

export const searchProducts = async (q: string, page = 1, limit = 12) => {
  const { categoryIds, brandIds } = await buildSearchCategoryAndBrandIds(q, prisma);

  // ── Build OR conditions ────────────────────────────────────────────────────
  // Bug cũ: spread object dẫn đến AND logic:
  //   { categoryId: {...}, brandId: {...} } → product phải thỏa CẢ HAI
  //   + fallback name chỉ chạy khi cả hai đều rỗng → "mac" không ra vì
  //     không match category/brand nào nhưng fallback lại bị bỏ qua (logic sai)
  //
  // Fix: luôn include name search + OR thêm category/brand nếu có match.
  // "mac" → name contains "mac" → MacBook Pro
  // "laptop" → category match "Laptop" OR name contains "laptop"
  // "apple" → brand match "Apple" OR name contains "apple"
  const orConditions: any[] = [{ name: { contains: q, mode: "insensitive" as const } }];

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

  // ── Count ──────────────────────────────────────────────────────────────────
  const total = await prisma.products.count({ where: scopeWhere });

  // ── Interleave theo brand để kết quả đa dạng ──────────────────────────────
  const distinctBrands = await prisma.products.findMany({
    where: scopeWhere,
    select: { brandId: true },
    distinct: ["brandId"],
  });

  const actualPerBrand = Math.max(2, Math.ceil(limit / Math.max(distinctBrands.length, 1)));

  const perBrandResults = await Promise.all(
    distinctBrands.map(({ brandId }) =>
      prisma.products.findMany({
        where: { ...scopeWhere, brandId },
        select: selectProductCard,
        orderBy: [{ isFeatured: "desc" }, { totalSoldCount: "desc" }],
        take: actualPerBrand,
      }),
    ),
  );

  // Round-robin interleave
  const interleaved: any[] = [];
  const queues = perBrandResults.map((items) => [...items]);
  let i = 0;
  while (interleaved.length < limit) {
    const anyLeft = queues.some((q) => q.length > 0);
    if (!anyLeft) break;
    const queue = queues[i % queues.length];
    if (queue.length > 0) interleaved.push(queue.shift()!);
    i++;
  }

  return { data: interleaved, total, page, limit, totalPages: Math.ceil(total / limit) };
};
