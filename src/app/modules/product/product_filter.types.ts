// Import Prisma enum — đây là source of truth cho filterType
// Prisma generate ra: export declare const FilterType: { RANGE: 'RANGE'; ENUM: 'ENUM'; BOOLEAN: 'BOOLEAN' }
import { FilterType } from "@prisma/client";

// Re-export để các file khác không cần import trực tiếp từ @prisma/client
export { FilterType };

// Filter option (một giá trị trong bộ lọc ENUM)
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Base — các field chung cho mọi loại filter
interface FilterGroupBase {
  key: string;
  name: string;
  source: "specification" | "attribute" | "built-in";
  sortOrder?: number;
}

// Discriminated union theo `type`
//
// Dùng string literal ("RANGE" | "ENUM" | "BOOLEAN") thay vì FilterType enum
// để `satisfies FilterGroup` hoạt động đúng.
//
// Lý do: Prisma FilterType.RANGE === "RANGE" ở runtime, nhưng TypeScript
// cần literal type để narrow. Khi so sánh trong service dùng FilterType enum,
// khi return object dùng "RANGE" as const — cả hai đều work.
export type FilterGroup =
  | (FilterGroupBase & {
      type: "RANGE";
      range: { min: number; max: number; unit?: string };
      options?: never;
    })
  | (FilterGroupBase & {
      type: "ENUM";
      options: FilterOption[];
      range?: never;
    })
  | (FilterGroupBase & {
      type: "BOOLEAN";
      options: FilterOption[];
      range?: never;
    });

// Response trả về từ API GET /products/filters
export interface CategoryFiltersResponse {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  filters: FilterGroup[];
}

// Query param khi user apply filter
export interface FilterQuery {
  category: string;
  brandId?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  // Dynamic: spec_os=Android, attr_storage=256GB...
  [key: string]: any;
}
