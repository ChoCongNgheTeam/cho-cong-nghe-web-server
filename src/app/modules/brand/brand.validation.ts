import { z } from "zod";

// Helper: parse query string boolean đúng cách
// z.coerce.boolean() sẽ coerce string "false" → true vì string non-empty là truthy
const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

const formBoolean = z.preprocess((v) => {
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}, z.boolean());

export const brandParamsSchema = z.object({
  id: z.string().uuid("ID thương hiệu không hợp lệ"),
});

export const brandSlugParamsSchema = z.object({
  slug: z.string().min(1, "Slug không được để trống"),
});

export const listBrandsQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),

  // Search & filter
  search: z.string().optional(),
  isFeatured: queryBoolean,
  isActive: queryBoolean,

  // Date range filter (ISO string hoặc YYYY-MM-DD)
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),

  // Sort
  sortBy: z.enum(["name", "createdAt", "productCount"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),

  // Admin only: xem cả brand đã soft delete
  includeDeleted: queryBoolean.pipe(z.boolean().optional().default(false)),
});

export const featuredBrandsQuerySchema = z.object({
  limit: z.coerce.number().positive().max(50).default(6),
});

export const createBrandSchema = z.object({
  name: z.string().trim().min(2, "Tên thương hiệu phải từ 2 ký tự").max(100, "Tên thương hiệu tối đa 100 ký tự"),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  isFeatured: formBoolean.optional().default(false),
  isActive: formBoolean.optional().default(true),
});

export const updateBrandSchema = z.object({
  name: z.string().trim().min(2, "Tên thương hiệu phải từ 2 ký tự").max(100, "Tên thương hiệu tối đa 100 ký tự").optional(),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  isFeatured: formBoolean.optional().default(false),
  isActive: formBoolean.optional().default(true),
  removeImage: z.boolean().optional(),
});

export const brandByCategoryQuerySchema = z.object({
  slug: z.string().min(1, "Slug category không được để trống"),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type ListBrandsQuery = z.infer<typeof listBrandsQuerySchema>;
