/**
 * shared.category-resolver.ts
 *
 * Shared utility để resolve category từ slug/name/text không dấu.
 * Dùng chung cho cả module search và product filter.
 *
 * Tại sao cần file này:
 *   - getDescendantCategoryIds(slug) chỉ tìm exact slug match
 *   - "dien thoai" (space) ≠ slug "dien-thoai" (hyphen) → không tìm được
 *   - "điện thoại" (có dấu) ≠ slug "dien-thoai" → không tìm được
 *   - buildSearchCategoryAndBrandIdsV2 đã giải quyết vấn đề này nhờ
 *     buildKeywordVariants (sinh ra cả "dien thoai" lẫn "dien-thoai")
 *
 * Usage trong buildProductWhere:
 *   Thay: const tree = await getDescendantCategoryIds(query.category)
 *   Bằng: const ids = await resolveCategoryIds(query.category, prisma)
 */

import { normalizeVietnamese, buildKeywordVariants } from "./search.helpers";

/**
 * Resolve category IDs (bao gồm toàn bộ descendants) từ một slug/text tùy ý.
 *
 * Thử lần lượt theo độ chính xác:
 *   1. Exact slug match        → "dien-thoai" = slug "dien-thoai"
 *   2. Slug variant match      → "dien thoai" → slug "dien-thoai" → match
 *   3. Name contains match     → "điện thoại" normalized → match name "Điện Thoại"
 *
 * Trả về [] nếu không tìm được category nào.
 */
export const resolveCategoryIds = async (categoryQuery: string, prismaClient: any): Promise<string[]> => {
  if (!categoryQuery?.trim()) return [];

  const variants = buildKeywordVariants(categoryQuery.trim());

  // Build OR conditions: thử tất cả variants cho cả slug lẫn name
  // Đây là cùng logic với buildSearchCategoryAndBrandIdsV2 nhưng tập trung
  // vào việc resolve 1 category cụ thể thay vì detect intent
  const orConditions = variants.flatMap((v) => [
    { slug: { equals: v, mode: "insensitive" as const } }, // exact slug
    { slug: { contains: v, mode: "insensitive" as const } }, // slug contains
    { name: { contains: v, mode: "insensitive" as const } }, // name contains
  ]);

  const matchedCats = await prismaClient.categories.findMany({
    where: {
      deletedAt: null,
      OR: orConditions,
    },
    select: { id: true, slug: true, name: true },
  });

  if (matchedCats.length === 0) return [];

  // Ưu tiên exact slug match — nếu có thì chỉ dùng cat đó, không lấy tất cả
  // Tránh case "dien" match cả "Điện Thoại" lẫn "Điện Máy" rồi lấy hết
  const normalizedQuery = normalizeVietnamese(categoryQuery.trim());
  const exactMatch = matchedCats.find(
    (c: any) => c.slug === normalizedQuery.replace(/\s+/g, "-") || normalizeVietnamese(c.slug) === normalizedQuery || normalizeVietnamese(c.name) === normalizedQuery,
  );

  const targetCats = exactMatch ? [exactMatch] : matchedCats;

  // Expand descendants qua recursive CTE
  const categoryIds: string[] = [];
  for (const cat of targetCats) {
    const rows: { id: string }[] = await prismaClient.$queryRaw`
      WITH RECURSIVE descendants AS (
        SELECT id FROM categories WHERE id = ${cat.id}::uuid AND "deletedAt" IS NULL
        UNION ALL
        SELECT c.id FROM categories c
        JOIN descendants d ON c."parentId" = d.id
        WHERE c."deletedAt" IS NULL
      )
      SELECT id FROM descendants
    `;
    rows.forEach((r: any) => categoryIds.push(r.id));
  }

  return [...new Set(categoryIds)];
};
