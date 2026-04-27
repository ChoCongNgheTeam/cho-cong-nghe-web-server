import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Chuyển "true"/"false" string → boolean (dùng cho query params) */
const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * listProductsSchema — public product listing.
 * .passthrough() giữ dynamic keys: spec_xxx, attr_xxx
 */
export const listProductsSchema = z
  .object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(50).default(12),
    search: z.string().optional(),
    category: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
    isFeatured: z.coerce.boolean().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    inStock: z.coerce.boolean().optional(),
    sortBy: z.enum(["createdAt", "name", "price", "viewsCount", "ratingAverage", "soldCount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .passthrough();

export const reviewsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(20).default(10),
  rating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const variantQuerySchema = z
  .object({ code: z.string().optional() })
  .passthrough()
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => k !== "code");
      return data.code || keys.length > 0;
    },
    { message: "Phải cung cấp code hoặc ít nhất một thuộc tính sản phẩm" },
  );

export type CompareProductsQuery = z.infer<typeof compareProductsSchema>;

/**
 * GET /products/admin/export
 * Filter giống adminListProductsSchema nhưng không có page/limit (lấy toàn bộ).
 * Thêm format + giới hạn 5000 rows.
 */
export const exportProductsSchema = z.object({
  format: z.enum(["csv", "excel"]).default("excel"),
  brandId: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional()),
  inStock: z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional()),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(5000).default(5000).optional(),
});

export const productParamsSchema = z.object({
  id: z.uuid({ message: "ID sản phẩm không hợp lệ" }),
});

export const productBySlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug không được để trống" }),
});

export const searchSuggestSchema = z.object({
  q: z.string().min(1, "Từ khóa không được để trống"),
  limit: z.coerce.number().positive().max(20).default(8),
  category: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * adminListProductsSchema — admin product listing.
 * Thêm: isActive, isFeatured, includeDeleted, dateFrom, dateTo
 */
export const adminListProductsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(500).default(20),
  search: z.string().optional(),
  brandId: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
  categoryId: z.string().uuid().optional(),
  isActive: queryBoolean,
  isFeatured: queryBoolean,
  inStock: queryBoolean,
  includeDeleted: queryBoolean,
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "viewsCount", "ratingAverage", "totalSoldCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * bulkActionSchema — dùng cho POST /admin/bulk
 */
export const bulkActionSchema = z.object({
  action: z.enum(["delete", "activate", "deactivate", "feature", "unfeature"]),
  ids: z.array(z.string().uuid()).min(1, "Cần ít nhất 1 sản phẩm"),
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / UPDATE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const colorImageSchema = z.object({
  color: z.string().min(1, "Màu sắc không được để trống"),
  altText: z.string().optional(),
});

const variantAttributeSchema = z.object({
  attributeOptionId: z.string().uuid(),
});

const createVariantSchema = z.object({
  code: z.string().min(1, "Mã SKU không được để trống"),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  isDefault: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  quantity: z.coerce.number().int().nonnegative().default(0),
  variantAttributes: z.array(variantAttributeSchema).min(1, "Variant phải có ít nhất 1 thuộc tính"),
});

export const createProductSchema = z
  .object({
    brandId: z.uuid("Brand ID không hợp lệ"),
    categoryId: z.uuid("Category ID không hợp lệ"),
    name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
    description: z.string().optional(),
    variants: z.array(createVariantSchema).min(1, "Sản phẩm phải có ít nhất 1 biến thể"),
    colorImages: z.array(colorImageSchema).min(1, "Sản phẩm phải có ít nhất 1 màu với ảnh"),
    specifications: z
      .array(
        z.object({
          specificationId: z.uuid(),
          value: z.string().min(1, "Giá trị thông số không được để trống"),
          isHighlight: z.boolean().optional().default(false),
        }),
      )
      .optional()
      .default([]),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.variants.filter((v) => v.isDefault).length === 1, { message: "Phải có đúng 1 biến thể mặc định", path: ["variants"] });

const updateVariantSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  isDefault: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  quantity: z.coerce.number().int().nonnegative().optional(),
  variantAttributes: z.array(variantAttributeSchema).optional(),
  _delete: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  variants: z.array(updateVariantSchema).optional(),
  colorImages: z.array(colorImageSchema).optional(),
  specifications: z
    .array(
      z.object({
        specificationId: z.string().uuid(),
        value: z.string().min(1),
        isHighlight: z.boolean().optional(),
      }),
    )
    .optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const variantOptionsQuerySchema = z.object({});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH TRENDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/search-trending
 *
 * q là optional (rỗng = show trending, có nội dung = filter + sort trending)
 */
export const searchSuggestTrendingSchema = z.object({
  q: z.string().default(""),
  limit: z.coerce.number().positive().max(20).default(8),
  category: z.string().optional(),
});

export type SearchSuggestTrendingQuery = z.infer<typeof searchSuggestTrendingSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SALE SCHEDULE V2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/sale-schedule-v2
 */
export const saleScheduleQuerySchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), { message: "startDate không hợp lệ (ISO 8601)" }),
  endDate: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), { message: "endDate không hợp lệ (ISO 8601)" }),
});

export type SaleScheduleQuery = z.infer<typeof saleScheduleQuerySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS ON SALE BY DATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/sale-by-date?date=2026-03-19&promotionId=xxx&page=1&limit=20
 */
export const saleByDateQuerySchema = z.object({
  date: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "date không hợp lệ (format: YYYY-MM-DD)",
  }),
  promotionId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

export type SaleByDateQuery = z.infer<typeof saleByDateQuerySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/compare?ids=id1,id2,id3
 *
 * ids là comma-separated UUIDs, tối đa 4.
 * VD: ?ids=uuid1,uuid2,uuid3
 */
export const compareProductsSchema = z.object({
  ids: z
    .string()
    .min(1, "Cần ít nhất 2 sản phẩm để so sánh")
    .transform((v) =>
      v
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().uuid("ID sản phẩm không hợp lệ")).min(2, "Cần ít nhất 2 sản phẩm").max(4, "Tối đa 4 sản phẩm")),
});

export type ExportProductsQuery = z.infer<typeof exportProductsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INFERRED TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ListProductsQuery = z.infer<typeof listProductsSchema>;
export type AdminListProductsQuery = z.infer<typeof adminListProductsSchema>;
export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantQuery = z.infer<typeof variantQuerySchema>;
export type SearchSuggestQuery = z.infer<typeof searchSuggestSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
