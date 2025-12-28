import { z } from "zod";

export const createProductSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  categories: z.array(z.string().uuid()).optional().default([]),
  variants: z
    .array(
      z.object({
        code: z.string().optional(),
        price: z.number().positive(),
        weight: z.number().positive().optional(),
        isDefault: z.boolean().optional(),
        quantity: z.number().int().nonnegative().optional(),
      })
    )
    .optional()
    .default([]),
    highlights: z.array(
    z.object({
      highlightId: z.string().uuid(),
      value: z.string().optional(), // Ví dụ: "8GB", "OLED"
    })
  ).optional().default([]),
});

export const updateProductSchema = z.object({
  brandId: z.string().uuid().optional(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  categories: z.array(z.string().uuid()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  highlights: z.array(
    z.object({
      highlightId: z.string().uuid(),
      value: z.string().optional(),
    })
  ).optional(),
});

export const listProductsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  sortBy: z.enum(["createdAt", "name", "viewsCount", "ratingAverage"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isFeatured: z.boolean().optional(),
});

export const productParamsSchema = z.object({
  id: z.string().uuid(),
});

export const productBySlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const variantParamsSchema = z.object({
  variantId: z.string().uuid(),
});

export const imageParamsSchema = z.object({
  imageId: z.string().uuid(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsSchema>;
