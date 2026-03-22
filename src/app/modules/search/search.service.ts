import prisma from "@/config/db";
import { buildSearchCategoryAndBrandIds } from "../product/product_filter.where-builder";
import { selectProductCard } from "../product/product.repository";
import { getProductsWithPricing } from "../pricing/use-cases/getProductsWithPricing.service"; // reuse existing

export const searchProducts = async (q: string, page = 1, limit = 12) => {
  const { categoryIds, brandIds } = await buildSearchCategoryAndBrandIds(q, prisma);

  const scopeWhere = {
    isActive: true,
    deletedAt: null,
    ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
    ...(brandIds.length > 0 ? { brandId: { in: brandIds } } : {}),
    ...(categoryIds.length === 0 && brandIds.length === 0 ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const total = await prisma.products.count({ where: scopeWhere });

  const distinctBrands = await prisma.products.findMany({
    where: scopeWhere,
    select: { brandId: true },
    distinct: ["brandId"],
  });

  const actualPerBrand = Math.max(2, Math.ceil(limit / Math.max(distinctBrands.length, 1)));

  // Fetch per brand + interleave
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

  const interleaved: any[] = [];
  const queues = perBrandResults.map((q) => [...q]);
  let i = 0;
  while (interleaved.length < limit) {
    const active = queues.filter((q) => q.length > 0);
    if (active.length === 0) break;
    const queue = queues[i % queues.length];
    if (queue.length > 0) interleaved.push(queue.shift()!);
    i++;
  }

  return { data: interleaved, total, page, limit, totalPages: Math.ceil(total / limit) };
};
