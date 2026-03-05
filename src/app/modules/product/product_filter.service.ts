import { FilterType } from "@prisma/client";
import {
  getDescendantCategoryIds,
  getFilterableSpecsByCategories,
  getDistinctSpecValues,
  getSpecValueRange,
  getVariantAttributesByCategories,
  getActiveAttributeOptionValues,
  getPriceRangeByCategories,
  getActiveBrandsByCategories,
} from "./product_filter.repository";
import { CategoryFiltersResponse, FilterGroup } from "./product_filter.types";

// Heuristic fallback: dùng khi spec.filterType = null (chưa được config)
const detectFilterTypeFallback = (values: string[]): FilterType => {
  if (values.length === 0) return FilterType.ENUM;

  const uniqueValues = [...new Set(values.map((v) => v.toLowerCase().trim()))];

  const BOOLEAN_SETS = [new Set(["có", "không"]), new Set(["yes", "no"]), new Set(["true", "false"]), new Set(["hỗ trợ", "không hỗ trợ"])];

  for (const boolSet of BOOLEAN_SETS) {
    const overlap = uniqueValues.filter((v) => boolSet.has(v));
    if (overlap.length >= 1 && uniqueValues.length <= 3) {
      return FilterType.BOOLEAN;
    }
  }

  const allNumeric = values.every((v) => {
    const stripped = v.replace(/[^0-9.,]/g, "").replace(",", ".");
    return stripped.length > 0 && !isNaN(parseFloat(stripped));
  });

  if (allNumeric && values.length > 3) {
    return FilterType.RANGE;
  }

  return FilterType.ENUM;
};

// ENUM spec keys: nên sort value theo số (VD: "6 GB" < "8 GB" < "12 GB")
const numericSortKeys = new Set(["ram", "storage", "screen_size", "battery_capacity", "refresh_rate"]);

const sortEnumValues = (values: string[], key: string): string[] => {
  if (numericSortKeys.has(key)) {
    return [...values].sort((a, b) => {
      const na = parseFloat(a.replace(/[^0-9.]/g, ""));
      const nb = parseFloat(b.replace(/[^0-9.]/g, ""));
      if (!isNaN(na) && !isNaN(nb)) return nb - na; // desc: 512 > 256 > 128
      return a.localeCompare(b);
    });
  }
  return values.sort((a, b) => a.localeCompare(b, "vi"));
};
// Attribute codes luôn bỏ qua (vì chúng được render ở variant selector)
// Chỉ filter attribute nào thực sự hữu ích để lọc danh sách sản phẩm
const SKIP_ATTRIBUTES = new Set(["color"]);
// MAIN SERVICE: Build dynamic filter config cho một category slug
export const getCategoryFilters = async (categorySlug: string): Promise<CategoryFiltersResponse> => {
  // Resolve category + tất cả category con
  const categoryTree = await getDescendantCategoryIds(categorySlug);
  if (!categoryTree) {
    throw new Error(`Category không tìm thấy: ${categorySlug}`);
  }

  const { ids: categoryIds, rootId, rootName, rootSlug } = categoryTree;

  const [brands, priceRange, filterableSpecs, variantAttributes] = await Promise.all([
    getActiveBrandsByCategories(categoryIds),
    getPriceRangeByCategories(categoryIds),
    getFilterableSpecsByCategories(categoryIds),
    getVariantAttributesByCategories(categoryIds),
  ]);

  const filters: FilterGroup[] = [];

  //  Built-in filter 1: Brand
  if (brands.length > 0) {
    filters.push({
      key: "brandId",
      name: "Hãng sản xuất",
      type: "ENUM",
      source: "built-in",
      sortOrder: 0,
      options: brands.map((b) => ({
        value: b.id,
        label: b.name,
      })),
    });
  }

  // Built-in filter 2: Price Range
  filters.push({
    key: "price",
    name: "Mức giá",
    type: "RANGE",
    source: "built-in",
    sortOrder: 1,
    range: priceRange,
  });

  // Dynamic filters: Variant Attributes (RAM, Storage, etc.)
  // Bỏ qua "color" vì FE đã có variant selector
  const attrFilters = await Promise.all(
    variantAttributes
      .filter((attr) => !SKIP_ATTRIBUTES.has(attr.code))
      .map(async (attr, idx) => {
        const activeValues = await getActiveAttributeOptionValues(attr.code, categoryIds);

        if (activeValues.length === 0) return null;

        // Attribute luôn là ENUM (storage: 128GB, 256GB...; RAM: 4GB, 8GB...)
        const sortedValues = sortEnumValues(
          activeValues.map((v) => v.value),
          attr.code,
        );

        // Map lại để lấy label
        const valueMap = new Map(activeValues.map((v) => [v.value, v.label]));

        return {
          key: `attr_${attr.code}`,
          name: attr.name,
          type: "ENUM" as const,
          source: "attribute" as const,
          sortOrder: 10 + idx,
          options: sortedValues.map((v) => ({
            value: v,
            label: valueMap.get(v) || v,
          })),
        } satisfies FilterGroup;
      }),
  );

  //  Dynamic filters: Specifications
  // Loại bỏ trùng lặp theo spec.id
  const seenSpecIds = new Set<string>();
  const uniqueSpecs = filterableSpecs.filter((cs) => {
    if (seenSpecIds.has(cs.specification.id)) return false;
    seenSpecIds.add(cs.specification.id);
    return true;
  });

  const specFilters = await Promise.all(
    uniqueSpecs.map(async (cs, idx) => {
      const spec = cs.specification;

      // Ưu tiên filterType đã được config trong DB (Prisma enum)
      // Fallback sang heuristic nếu chưa set (filterType = null)
      let filterType: FilterType;

      if (spec.filterType) {
        filterType = spec.filterType;
      } else {
        const sampleValues = await getDistinctSpecValues(spec.id, categoryIds);
        if (sampleValues.length === 0) return null;
        filterType = detectFilterTypeFallback(sampleValues);
      }

      // Build filter group theo type
      if (filterType === FilterType.RANGE) {
        const rangeData = await getSpecValueRange(spec.id, categoryIds);
        if (!rangeData) return null;

        return {
          key: `spec_${spec.key}`,
          name: spec.name,
          type: "RANGE" as const,
          source: "specification" as const,
          sortOrder: 20 + (cs.sortOrder ?? idx),
          range: {
            min: rangeData.min,
            max: rangeData.max,
            unit: spec.unit ?? undefined,
          },
        } satisfies FilterGroup;
      }

      if (filterType === FilterType.BOOLEAN) {
        return {
          key: `spec_${spec.key}`,
          name: spec.name,
          type: "BOOLEAN" as const,
          source: "specification" as const,
          sortOrder: 20 + (cs.sortOrder ?? idx),
          options: [{ value: "true", label: "Có hỗ trợ" }],
        } satisfies FilterGroup;
      }

      // ENUM
      const values = await getDistinctSpecValues(spec.id, categoryIds);
      if (values.length === 0) return null;

      const sorted = sortEnumValues(values, spec.key);

      return {
        key: `spec_${spec.key}`,
        name: spec.name,
        type: "ENUM" as const,
        source: "specification" as const,
        sortOrder: 20 + (cs.sortOrder ?? idx),
        options: sorted.map((v) => ({ value: v, label: v })),
      } satisfies FilterGroup;
    }),
  );

  // Gộp tất cả, bỏ null, sort theo sortOrder
  const allFilters: FilterGroup[] = [...filters, ...(attrFilters.filter((f) => f !== null) as FilterGroup[]), ...(specFilters.filter((f) => f !== null) as FilterGroup[])].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99),
  );

  return {
    categoryId: rootId,
    categorySlug: rootSlug,
    categoryName: rootName,
    filters: allFilters,
  };
};
