import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Query schema để lấy filter config của một category
// GET /products/filters?category=dien-thoai
// ─────────────────────────────────────────────────────────────────────────────
export const categoryFiltersQuerySchema = z.object({
  category: z.string().min(1, "Category slug không được để trống"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Query schema khi user apply filter (mở rộng từ listProductsSchema hiện tại)
// GET /products?category=dien-thoai&brandId=xxx&attr_storage=256GB&spec_os=Android
//
// NOTE: Schema này dùng .passthrough() để cho phép dynamic keys như spec_xxx và attr_xxx
// Validation ở tầng service sẽ xử lý các key động này
// ─────────────────────────────────────────────────────────────────────────────
export const listProductsWithFiltersSchema = z
  .object({
    // Pagination
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(50).default(12),

    // Search
    search: z.string().optional(),

    // Category
    category: z.string().optional(),
    categoryId: z.string().uuid().optional(),

    // Built-in filters
    brandId: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
    isFeatured: z.coerce.boolean().optional(),

    // Price range
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),

    // Rating filter
    minRating: z.coerce.number().min(0).max(5).optional(),

    // Availability
    inStock: z.coerce.boolean().optional(),

    // Sort
    sortBy: z.enum(["createdAt", "name", "price", "viewsCount", "ratingAverage", "soldCount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .passthrough(); // Cho phép dynamic keys: spec_xxx, attr_xxx

export type CategoryFiltersQuery = z.infer<typeof categoryFiltersQuerySchema>;
export type ListProductsWithFiltersQuery = z.infer<typeof listProductsWithFiltersSchema>;
