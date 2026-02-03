import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên thương hiệu phải từ 2 ký tự")
    .max(100, "Tên thương hiệu tối đa 100 ký tự"),

  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

  isFeatured: z.boolean().optional().default(false),

  isActive: z.boolean().optional().default(true),
});

export const updateBrandSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Tên thương hiệu phải từ 2 ký tự")
      .max(100, "Tên thương hiệu tối đa 100 ký tự")
      .optional(),

    description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),

    isFeatured: z.boolean().optional(),

    isActive: z.boolean().optional(),

    // Cho phép xóa image bằng cách gửi removeImage: true
    removeImage: z.boolean().optional(),
  })
  .strict();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
