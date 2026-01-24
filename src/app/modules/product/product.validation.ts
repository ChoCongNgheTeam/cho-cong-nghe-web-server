import { z } from "zod";

// =====================
// === QUERY SCHEMAS ===
// =====================

export const listProductsSchema = z.object({
  // Pagination
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(12),

  // Search
  search: z.string().optional(),

  // Filters
  category: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isFeatured: z.coerce.boolean().optional(),

  // Price range
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),

  // Rating filter
  minRating: z.coerce.number().min(0).max(5).optional(),

  // Availability
  inStock: z.coerce.boolean().optional(),

  // Sort
  sortBy: z
    .enum(["createdAt", "name", "price", "viewsCount", "ratingAverage", "soldCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const reviewsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(20).default(10),
  rating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const variantQuerySchema = z
  .object({
    code: z.string().optional(),
  })
  .passthrough()
  .refine(
    (data) => {
      const keys = Object.keys(data).filter((k) => k !== "code");
      return data.code || keys.length > 0;
    },
    {
      message: "Phải cung cấp code hoặc ít nhất một thuộc tính sản phẩm",
    },
  );

// =====================
// === PARAMS SCHEMAS ===
// =====================

export const productParamsSchema = z.object({
  id: z.string().uuid({ message: "ID sản phẩm không hợp lệ" }),
});

export const productBySlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug không được để trống" }),
});

// =====================
// === CREATE/UPDATE SCHEMAS ===
// =====================

// Color image schema - không còn liên kết với variant
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
  .refine(
    (data) => {
      const defaultCount = data.variants.filter((v) => v.isDefault).length;
      return defaultCount === 1;
    },
    {
      message: "Phải có đúng 1 biến thể mặc định",
      path: ["variants"],
    },
  );

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

// =====================
// === TYPE EXPORTS ===
// =====================

export type ListProductsQuery = z.infer<typeof listProductsSchema>;
export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantQuery = z.infer<typeof variantQuerySchema>;
