import { z } from "zod";

export const categoryParamsSchema = z.object({
  id: z.uuid({ message: "ID danh mục không hợp lệ" }),
});

export const categorySlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug không được để trống" }),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid({ message: "Category ID không hợp lệ" }),
});

export const attributeIdParamSchema = z.object({
  attributeId: z.string().min(1, { message: "Attribute ID không hợp lệ" }),
});

export const listCategoriesQuerySchema = z.object({
  search: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "position", "createdAt"]).default("position"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const featuredCategoriesQuerySchema = z.object({
  limit: z.coerce.number().positive().max(50).default(6),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải từ 2 ký tự")
    .max(100, "Tên danh mục tối đa 100 ký tự"),

  parentId: z.uuid("Parent ID không hợp lệ").optional().or(z.literal("")),

  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),

  position: z.coerce.number().int().min(0).optional(),

  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải từ 2 ký tự")
    .max(100, "Tên danh mục tối đa 100 ký tự")
    .optional(),

  parentId: z.uuid("Parent ID không hợp lệ").optional().or(z.literal("")),

  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),

  position: z.coerce.number().int().min(0).optional(),

  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),

  removeImage: z.boolean().optional(),
});

export const reorderCategorySchema = z.object({
  categoryId: z.uuid("Category ID không hợp lệ"),
  newPosition: z.number().int().min(0, "Position phải >= 0"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoryInput = z.infer<typeof reorderCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
