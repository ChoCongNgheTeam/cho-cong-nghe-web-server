// product_filter.service.ts

import { FilterType } from "@prisma/client";
import {
  getDescendantCategoryIds,
  getFilterableSpecsByCategories,
  getDistinctSpecValues,
  getSpecValueRange,
  getVariantAttributesByCategories,
  getPriceRangeByCategories,
  getActiveBrandsByCategories,
  getBatchActiveAttributeOptions, // ← import hàm mới
} from "./product_filter.repository";
import { CategoryFiltersResponse, FilterGroup } from "./product_filter.types";

// ─────────────────────────────────────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidateAll(): void {
    this.store.clear();
  }
}

const filterCache = new SimpleCache<CategoryFiltersResponse>();
const FILTER_CACHE_TTL = 5 * 60 * 1000; // 5 phút

export const invalidateFilterCache = (categorySlug?: string) => {
  if (categorySlug) {
    filterCache.invalidate(`filters:${categorySlug}`);
  } else {
    filterCache.invalidateAll();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS (giữ nguyên từ file cũ)
// ─────────────────────────────────────────────────────────────────────────────

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

const numericSortKeys = new Set(["ram", "storage", "screen_size", "battery_capacity", "refresh_rate"]);

const sortEnumValues = (values: string[], key: string): string[] => {
  if (numericSortKeys.has(key)) {
    return [...values].sort((a, b) => {
      const na = parseFloat(a.replace(/[^0-9.]/g, ""));
      const nb = parseFloat(b.replace(/[^0-9.]/g, ""));
      if (!isNaN(na) && !isNaN(nb)) return nb - na;
      return a.localeCompare(b);
    });
  }
  return values.sort((a, b) => a.localeCompare(b, "vi"));
};

const SKIP_ATTRIBUTES = new Set(["color"]);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export const getCategoryFilters = async (categorySlug: string): Promise<CategoryFiltersResponse> => {
  const cacheKey = `filters:${categorySlug}`;

  // Cache hit → trả về ngay, không chạm DB
  const cached = filterCache.get(cacheKey);
  if (cached) return cached;

  // Resolve category tree
  const categoryTree = await getDescendantCategoryIds(categorySlug);
  if (!categoryTree) {
    throw new Error(`Category không tìm thấy: ${categorySlug}`);
  }

  const { ids: categoryIds, rootId, rootName, rootSlug } = categoryTree;

  // Fetch tất cả data cần thiết song song
  const [brands, priceRange, filterableSpecs, variantAttributes] = await Promise.all([
    getActiveBrandsByCategories(categoryIds),
    getPriceRangeByCategories(categoryIds),
    getFilterableSpecsByCategories(categoryIds),
    getVariantAttributesByCategories(categoryIds),
  ]);

  const filters: FilterGroup[] = [];

  // Built-in filter 1: Brand
  if (brands.length > 0) {
    filters.push({
      key: "brandId",
      name: "Hãng sản xuất",
      type: "ENUM",
      source: "built-in",
      sortOrder: 0,
      options: brands.map((b) => ({ value: b.id, label: b.name })),
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

  // ─────────────────────────────────────────────────────────────────────────
  // FIX #3: Batch query thay vì N queries
  // ─────────────────────────────────────────────────────────────────────────
  const filteredAttrs = variantAttributes.filter((attr) => !SKIP_ATTRIBUTES.has(attr.code));

  // 1 query duy nhất lấy tất cả attribute options
  const batchAttrOptions = await getBatchActiveAttributeOptions(
    filteredAttrs.map((a) => a.code),
    categoryIds,
  );

  const attrFilters: FilterGroup[] = filteredAttrs
    .map((attr, idx) => {
      const activeValues = batchAttrOptions.get(attr.code) ?? [];
      if (activeValues.length === 0) return null;

      const sortedValues = sortEnumValues(
        activeValues.map((v) => v.value),
        attr.code,
      );
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
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);
  // ─────────────────────────────────────────────────────────────────────────
  // Spec filters (giữ nguyên logic cũ)
  // ─────────────────────────────────────────────────────────────────────────
  const seenSpecIds = new Set<string>();
  const uniqueSpecs = filterableSpecs.filter((cs) => {
    if (seenSpecIds.has(cs.specification.id)) return false;
    seenSpecIds.add(cs.specification.id);
    return true;
  });

  const specFilters = await Promise.all(
    uniqueSpecs.map(async (cs, idx) => {
      const spec = cs.specification;

      let filterType: FilterType;
      if (spec.filterType) {
        filterType = spec.filterType;
      } else {
        const sampleValues = await getDistinctSpecValues(spec.id, categoryIds);
        if (sampleValues.length === 0) return null;
        filterType = detectFilterTypeFallback(sampleValues);
      }

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
  const allFilters: FilterGroup[] = [...filters, ...attrFilters, ...(specFilters.filter((f) => f !== null) as FilterGroup[])].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  const result: CategoryFiltersResponse = {
    categoryId: rootId,
    categorySlug: rootSlug,
    categoryName: rootName,
    filters: allFilters,
  };

  // Lưu cache trước khi trả về
  filterCache.set(cacheKey, result, FILTER_CACHE_TTL);

  return result;
};
