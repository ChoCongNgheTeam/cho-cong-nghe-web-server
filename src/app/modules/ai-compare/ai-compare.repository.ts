// ============================================================
// ai-compare.repository.ts
// Prisma query để lấy products cho AI compare
//
// Reuse select fragment pattern từ product.repository.ts.
// Query các bảng:
//   products → brand (brands)
//            → img (product_color_images) — lấy thumbnail
//            → variants (products_variants) — lấy giá
//            → productSpecifications (product_specifications)
//                  → specification (specifications: key, name, unit, group, icon)
// ============================================================

import prisma from "@/config/db";
import { ProductForAI } from "./transform.product.specs";

// ─── Select fragment ──────────────────────────────────────────────────────────
// Khớp hoàn toàn với schema.prisma và các field cần dùng

const selectProductForAI = {
  id: true,
  name: true,
  slug: true,
  brand: {
    select: { id: true, name: true, slug: true },
  },
  // Thumbnail: lấy ảnh đầu tiên theo color + position (giống selectProductCard)
  img: {
    select: { imageUrl: true },
    orderBy: [
      { color: "asc" },
      { position: "asc" },
    ] as any,
    take: 1,
  },
  // Giá: lấy variant active, ưu tiên isDefault
  variants: {
    where: {
      isActive: true,
      deletedAt: null,
    },
    select: {
      price: true,
      isDefault: true,
      isActive: true,
    },
    orderBy: { isDefault: "desc" as const },
  },
  // Thông số kỹ thuật: lấy TẤT CẢ (không filter isHighlight)
  // để AI có đủ dữ liệu so sánh
  productSpecifications: {
    select: {
      specificationId: true,
      value: true,
      isHighlight: true,
      sortOrder: true,
      specification: {
        select: {
          id: true,
          key: true,
          name: true,
          group: true,
          unit: true,
          icon: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  },
} as any;

// ─── Repository function ──────────────────────────────────────────────────────

/**
 * findProductsForAICompare
 *
 * Lấy danh sách sản phẩm với đầy đủ specs để AI phân tích.
 * Chỉ lấy sản phẩm isActive = true, deletedAt = null (giống public endpoints).
 *
 * @returns ProductForAI[] — giữ đúng thứ tự ids truyền vào
 */
export async function findProductsForAICompare(
  ids: string[]
): Promise<ProductForAI[]> {
  const products = await prisma.products.findMany({
    where: {
      id: { in: ids },
      isActive: true,
      deletedAt: null,
    },
    select: selectProductForAI as any,
  });

  // Giữ thứ tự theo ids truyền vào (Prisma không đảm bảo thứ tự IN query)
  const productMap = new Map(products.map((p: any) => [p.id, p]));
  return ids
    .map((id) => productMap.get(id))
    .filter((p: any): p is NonNullable<typeof p> => p !== undefined) as ProductForAI[];
}