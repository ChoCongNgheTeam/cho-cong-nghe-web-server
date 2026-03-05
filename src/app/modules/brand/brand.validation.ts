import { z } from "zod";

export const brandParamsSchema = z.object({
  id: z.string().uuid({ message: "ID thương hiệu không hợp lệ" }),
});

export const brandSlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug không được để trống" }),
});

export const listBrandsQuerySchema = z.object({
  search: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(["name", "createdAt", "productCount"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const featuredBrandsQuerySchema = z.object({
  limit: z.coerce.number().positive().max(50).default(6),
});

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên thương hiệu phải từ 2 ký tự")
    .max(100, "Tên thương hiệu tối đa 100 ký tự"),

  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),

  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên thương hiệu phải từ 2 ký tự")
    .max(100, "Tên thương hiệu tối đa 100 ký tự")
    .optional(),

  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),

  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),

  removeImage: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type ListBrandsQuery = z.infer<typeof listBrandsQuerySchema>;