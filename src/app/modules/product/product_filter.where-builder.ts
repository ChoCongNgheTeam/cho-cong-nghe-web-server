import { Prisma } from "@prisma/client";
import { getDescendantCategoryIds } from "./product_filter.repository";
// Normalize: ?attr_storage=256GB hoặc ?attr_storage=256GB&attr_storage=512GB
const toArray = (value: string | string[]): string[] => (Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean));
// Parse dynamic keys ra 2 nhóm:
//   spec_xxx  → lọc qua product_specifications (isFilterable specs)
//   attr_xxx  → lọc qua variants_attributes (color, storage, ram...)
interface ParsedDynamicFilters {
  specFilters: Record<string, string | string[]>;
  attrFilters: Record<string, string | string[]>;
}

const parseDynamicFilters = (query: Record<string, any>): ParsedDynamicFilters => {
  const specFilters: Record<string, string | string[]> = {};
  const attrFilters: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("spec_")) specFilters[key.slice(5)] = value;
    else if (key.startsWith("attr_")) attrFilters[key.slice(5)] = value;
  }

  return { specFilters, attrFilters };
};
// Build spec filter condition
//
// BOOLEAN (spec_nfc=true):
//   → product có spec key=nfc VÀ value KHÔNG thuộc tập "Không"/"No"...
//
// RANGE (spec_screen_size_min=5&spec_screen_size_max=6.5):
//   → detect suffix _min/_max, ép kiểu số rồi filter
//
// ENUM (spec_os=Android hoặc spec_os=Android&spec_os=iOS):
//   → value IN [values] case-insensitive
const BOOLEAN_NEGATIVE_VALUES = ["không", "không hỗ trợ", "không có", "no", "false", "0"];

const buildSpecConditions = (specFilters: Record<string, string | string[]>): Prisma.productsWhereInput[] => {
  const conditions: Prisma.productsWhereInput[] = [];

  // Gom các key _min/_max lại trước
  const rangeMap: Record<string, { min?: number; max?: number }> = {};
  const regularFilters: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(specFilters)) {
    if (key.endsWith("_min")) {
      const baseKey = key.slice(0, -4);
      rangeMap[baseKey] = { ...rangeMap[baseKey], min: Number(value) };
    } else if (key.endsWith("_max")) {
      const baseKey = key.slice(0, -4);
      rangeMap[baseKey] = { ...rangeMap[baseKey], max: Number(value) };
    } else {
      regularFilters[key] = value;
    }
  }

  // Xử lý RANGE specs (spec_screen_size_min=5&spec_screen_size_max=6.5)
  for (const [specKey, { min, max }] of Object.entries(rangeMap)) {
    if (min === undefined && max === undefined) continue;

    conditions.push({
      productSpecifications: {
        some: {
          specification: { key: specKey },
          // Dùng raw comparison vì value là string trong DB
          // Prisma không hỗ trợ CAST trực tiếp → dùng string comparison
          // Cách đúng nhất: lấy products có spec key này rồi filter ở app layer
          // Nhưng để đơn giản và không N+1 query, dùng gte/lte trên string
          // → hoạt động tốt khi value là số thuần (không có đơn vị)
          AND: [...(min !== undefined ? [{ value: { gte: String(min) } }] : []), ...(max !== undefined ? [{ value: { lte: String(max) } }] : [])],
        },
      },
    });
  }

  // Xử lý BOOLEAN và ENUM specs
  for (const [specKey, filterValue] of Object.entries(regularFilters)) {
    const values = toArray(filterValue as string | string[]);
    if (values.length === 0) continue;

    const isBooleanTrue = values.length === 1 && values[0].toLowerCase() === "true";

    conditions.push({
      productSpecifications: {
        some: {
          specification: { key: specKey },
          ...(isBooleanTrue
            ? {
                // BOOLEAN: exclude "Không", "No", etc.
                NOT: {
                  value: {
                    in: BOOLEAN_NEGATIVE_VALUES,
                    mode: "insensitive" as const,
                  },
                },
              }
            : {
                // ENUM: match một trong các values (OR logic trong 1 filter)
                value: {
                  in: values,
                  mode: "insensitive" as const,
                },
              }),
        },
      },
    });
  }

  return conditions;
};
// Build attribute filter condition
// attr_storage=256GB&attr_storage=512GB → OR logic (multi-select)
// attr_storage=256GB&attr_ram=8GB       → AND logic (cross-attribute)
const buildAttrConditions = (attrFilters: Record<string, string | string[]>): Prisma.productsWhereInput[] => {
  const conditions: Prisma.productsWhereInput[] = [];

  for (const [attrCode, filterValue] of Object.entries(attrFilters)) {
    const values = toArray(filterValue as string | string[]);
    if (values.length === 0) continue;

    // Product phải có ít nhất 1 active variant match attribute này
    conditions.push({
      variants: {
        some: {
          isActive: true,
          variantAttributes: {
            some: {
              attributeOption: {
                attribute: { code: attrCode },
                value: { in: values, mode: "insensitive" },
              },
            },
          },
        },
      },
    });
  }

  return conditions;
};
// Build orderBy
export const buildOrderBy = (sortBy?: string, sortOrder?: "asc" | "desc"): any => {
  const order = sortOrder ?? "desc";

  if (sortBy === "price") {
    // Sắp xếp theo giá của default variant
    return [{ variants: { _count: order } }];
  }

  if (sortBy && ["createdAt", "name", "viewsCount", "ratingAverage", "soldCount", "totalSoldCount"].includes(sortBy)) {
    return { [sortBy]: order };
  }

  // Default: hot products
  return [{ totalSoldCount: "desc" }, { ratingAverage: "desc" }, { createdAt: "desc" }, { id: "asc" }];
};
// MAIN: buildProductWhere — thay thế hoàn toàn hàm cũ trong product.repository
//
// Nhận TOÀN BỘ query object (bao gồm cả dynamic spec_xxx và attr_xxx)
// Type: Record<string, any> để tương thích với passthrough() schema
export const buildProductWhere = async (query: Record<string, any>, onlyActive: boolean): Promise<Prisma.productsWhereInput> => {
  const andConditions: Prisma.productsWhereInput[] = [];

  const where: Prisma.productsWhereInput = {};

  //  Active / soft delete
  if (onlyActive) where.isActive = true;
  where.deletedAt = null;

  //  Search
  if (query.search?.trim()) {
    where.OR = [{ name: { contains: query.search.trim(), mode: "insensitive" } }, { description: { contains: query.search.trim(), mode: "insensitive" } }];
  }

  //  Category (slug → toàn bộ sub-category IDs)
  if (query.category) {
    const tree = await getDescendantCategoryIds(query.category);
    if (tree) {
      where.categoryId = { in: tree.ids };
    }
  }

  // categoryId override category slug nếu cả 2 cùng có
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  //  Brand (multi-select: ?brandId=a&brandId=b)
  if (query.brandId) {
    const brandIds = toArray(query.brandId as string | string[]);
    if (brandIds.length === 1) {
      where.brandId = brandIds[0];
    } else if (brandIds.length > 1) {
      where.brandId = { in: brandIds };
    }
  }

  //  isFeatured
  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured;
  }

  //  Price range — gộp với inStock vào variants.some
  // Tránh ghi đè nhau (Prisma chỉ cho 1 variants filter)
  const variantWhere: Prisma.products_variantsWhereInput = {
    isActive: true,
  };

  if (query.minPrice) variantWhere.price = { gte: query.minPrice };
  if (query.maxPrice) {
    variantWhere.price = {
      ...(variantWhere.price as object),
      lte: query.maxPrice,
    };
  }
  if (query.inStock) {
    variantWhere.quantity = { gt: 0 };
  }

  // Chỉ add nếu có ít nhất 1 điều kiện ngoài isActive
  const hasVariantFilter = query.minPrice || query.maxPrice || query.inStock;
  if (hasVariantFilter) {
    where.variants = { some: variantWhere };
  }

  //  Rating
  if (query.minRating) {
    where.ratingAverage = { gte: query.minRating };
  }

  //  Dynamic: spec_xxx & attr_xxx
  const { specFilters, attrFilters } = parseDynamicFilters(query);

  const specConditions = buildSpecConditions(specFilters);
  const attrConditions = buildAttrConditions(attrFilters);

  // Tất cả dynamic conditions là AND (mỗi filter phải thỏa mãn)
  andConditions.push(...specConditions, ...attrConditions);

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
};
