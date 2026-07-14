import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { selectProductCard } from "../product/product.repository";

// Order áp dụng cho mọi query product pool — relevanceSort ở service layer
// chỉ làm nhiệm vụ phân tier prefix/contains, không thay thế order này.
export const PRODUCT_ORDER_BY = [{ isFeatured: "desc" as const }, { totalSoldCount: "desc" as const }, { ratingAverage: "desc" as const }, { createdAt: "desc" as const }];

// =====================
// === COUNT ===
// =====================

export const countProducts = (where: Prisma.productsWhereInput) => prisma.products.count({ where });

// =====================
// === PRODUCT POOL (Strategy A / Strategy B single-brand) ===
// =====================

export const findProductPool = (where: Prisma.productsWhereInput, take: number) => prisma.products.findMany({ where, select: selectProductCard, orderBy: PRODUCT_ORDER_BY, take });

// `selectProductCard` (product.repository.ts) không có `satisfies Prisma.productsSelect`
// nên field `true` bị widen thành `boolean` — nếu suy `ProductCardRow` độc lập qua
// `Prisma.productsGetPayload<{select: typeof selectProductCard}>` sẽ RA KHÁC với type
// thật mà `.findMany()` tự suy luận tại chỗ gọi (đã gặp lỗi này khi build).
// Lấy trực tiếp từ kết quả thật của `findProductPool` để đảm bảo luôn khớp 100%.
export type ProductCardRow = Awaited<ReturnType<typeof findProductPool>>[number];

// =====================
// === MULTI-BRAND (Strategy B) ===
// =====================

export const findDistinctBrandIds = async (where: Prisma.productsWhereInput): Promise<string[]> => {
  const rows = await prisma.products.findMany({ where, select: { brandId: true }, distinct: ["brandId"] });
  return rows.map((r) => r.brandId);
};

export const findProductsByBrand = (where: Prisma.productsWhereInput, brandId: string, take: number) =>
  prisma.products.findMany({ where: { ...where, brandId }, select: selectProductCard, orderBy: PRODUCT_ORDER_BY, take });

// =====================
// === CATEGORY / BRAND INTENT CANDIDATES ===
// =====================

export const findCategoriesByName = (nameOnlyConditions: Prisma.categoriesWhereInput[]) =>
  prisma.categories.findMany({ where: { deletedAt: null, OR: nameOnlyConditions }, select: { id: true, name: true } });

export const findCategoriesByNameOrSlug = (nameOrSlugConditions: Prisma.categoriesWhereInput[]) =>
  prisma.categories.findMany({ where: { deletedAt: null, OR: nameOrSlugConditions }, select: { id: true } });

export const findBrandsByName = (nameOnlyConditions: Prisma.brandsWhereInput[]) => prisma.brands.findMany({ where: { deletedAt: null, OR: nameOnlyConditions }, select: { id: true, name: true } });

export const findBrandsByNameOrSlug = (nameOrSlugConditions: Prisma.brandsWhereInput[]) => prisma.brands.findMany({ where: { deletedAt: null, OR: nameOrSlugConditions }, select: { id: true } });

// Gộp lookup descendant category theo TẤT CẢ root category id thành 1 query CTE
// (WHERE id = ANY(...)) thay vì loop 1 query riêng cho từng root id (N+1).
export const findCategoryDescendantIds = async (rootIds: string[]): Promise<string[]> => {
  if (rootIds.length === 0) return [];

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE descendants AS (
      SELECT id FROM categories WHERE id = ANY(${rootIds}::uuid[]) AND "deletedAt" IS NULL
      UNION ALL
      SELECT c.id FROM categories c
      JOIN descendants d ON c."parentId" = d.id
      WHERE c."deletedAt" IS NULL
    )
    SELECT id FROM descendants
  `;

  return rows.map((r) => r.id);
};
