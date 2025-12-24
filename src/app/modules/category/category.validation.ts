import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải từ 2 ký tự")
    .max(100, "Tên danh mục tối đa 100 ký tự"),

  parentId: z.uuid("Parent ID không hợp lệ").optional().or(z.literal("")),

  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

  categoryImage: z.url("URL hình ảnh không hợp lệ").optional().or(z.literal("")),

  position: z.number().int().min(0).optional(),

  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Tên danh mục phải từ 2 ký tự")
      .max(100, "Tên danh mục tối đa 100 ký tự")
      .optional(),

    parentId: z.uuid("Parent ID không hợp lệ").optional().or(z.literal("")),

    description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

    categoryImage: z.url("URL hình ảnh không hợp lệ").optional().or(z.literal("")),

    position: z.number().int().min(0).optional(),

    isActive: z.boolean().optional(),
  })
  .strict();

export const reorderCategorySchema = z.object({
  categoryId: z.uuid("Category ID không hợp lệ"),
  newPosition: z.number().int().min(0, "Position phải >= 0"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoryInput = z.infer<typeof reorderCategorySchema>;
