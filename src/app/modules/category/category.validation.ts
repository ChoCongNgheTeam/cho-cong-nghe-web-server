import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * booleanQuery — parse query string boolean đúng cách.
 * z.coerce.boolean() sai vì Boolean("false") === true.
 */
const booleanQuery = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (typeof val === "boolean") return val;
    if (val === "true" || val === "1") return true;
    if (val === "false" || val === "0") return false;
    return undefined;
  });

// ─────────────────────────────────────────────────────────────────────────────
// PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export const categoryParamsSchema = z.object({
  id: z.string().uuid("ID danh mục không hợp lệ"),
});

export const categorySlugParamsSchema = z.object({
  slug: z.string().min(1, "Slug không được để trống"),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid("Category ID không hợp lệ"),
});

export const attributeIdParamSchema = z.object({
  attributeId: z.string().min(1, "Attribute ID không hợp lệ"),
});

// ─────────────────────────────────────────────────────────────────────────────
// QUERY
// parentId không dùng transform — giữ string, repository tự check
// "root" → WHERE parentId IS NULL
// UUID   → WHERE parentId = UUID
// ─────────────────────────────────────────────────────────────────────────────

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(200).default(20),
  search: z.string().optional(),
  parentId: z.string().optional(), // "root" | UUID | undefined
  isFeatured: booleanQuery,
  isActive: booleanQuery,
  rootOnly: booleanQuery,
  sortBy: z.enum(["name", "position", "createdAt"]).default("position"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  includeDeleted: booleanQuery.pipe(z.boolean().optional().default(false)),
});

export const featuredCategoriesQuerySchema = z.object({
  limit: z.coerce.number().positive().max(50).default(6),
});

export const resolveCategoryQuerySchema = z.object({
  q: z.string().min(1, "Từ khóa không được để trống"),
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục phải từ 2 ký tự").max(100, "Tên danh mục tối đa 100 ký tự"),
  parentId: z.string().uuid("Parent ID không hợp lệ").optional().or(z.literal("")),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
  isFeatured: booleanQuery.pipe(z.boolean().optional().default(false)),
  isActive: booleanQuery.pipe(z.boolean().optional().default(true)),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục phải từ 2 ký tự").max(100, "Tên danh mục tối đa 100 ký tự").optional(),
  parentId: z.string().uuid("Parent ID không hợp lệ").optional().or(z.literal("")),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
  isFeatured: booleanQuery,
  isActive: booleanQuery,
  removeImage: booleanQuery,
});

export const reorderCategorySchema = z.object({
  categoryId: z.string().uuid("Category ID không hợp lệ"),
  newPosition: z.number().int().min(0, "Position phải >= 0"),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoryInput = z.infer<typeof reorderCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
