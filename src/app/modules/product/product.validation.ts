import { z } from "zod";

export const createProductSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  
  // Categories có thể là mảng string UUID
  categories: z.array(z.string().uuid()).optional().default([]),

  variants: z
    .array(
      z.object({
        code: z.string().optional(),
        
        // --- QUAN TRỌNG: Dùng z.coerce cho số và boolean ---
        price: z.coerce.number().positive(), 
        weight: z.coerce.number().positive().optional(),
        isDefault: z.coerce.boolean().optional(),
        quantity: z.coerce.number().int().nonnegative().optional(),
        // ----------------------------------------------------

        images: z.array(
          z.object({
            imageUrl: z.string().url(),
            publicId: z.string().optional(),
            altText: z.string().optional(),
          })
        ).optional().default([]),
        variantAttributes: z.array(
          z.object({
            attributeOptionId: z.string().uuid(),
          })
        ).optional().default([]),
      })
    )
    .optional()
    .default([]),

  highlights: z.array(
    z.object({
      highlightId: z.string().uuid(),
      value: z.string().optional(),
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
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(), // ID để update variant cũ
        code: z.string().optional(),
        price: z.number().positive().optional(),
        weight: z.number().positive().optional(),
        isDefault: z.boolean().optional(),
        quantity: z.number().int().nonnegative().optional(),
        images: z.array(
          z.object({
            imageUrl: z.string().url(),
            publicId: z.string().optional(),
            altText: z.string().optional(),
          })
        ).optional(),
        variantAttributes: z.array(
          z.object({
            attributeOptionId: z.string().uuid(),
          })
        ).optional(),
      })
    )
    .optional(),
  highlights: z.array(
    z.object({
      highlightId: z.string().uuid(),
      value: z.string().optional(),
    })
  ).optional(),
});

export const listProductsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(10).default(10),
  search: z.string().optional(),
  // Cho phép lọc bằng slug (ví dụ: 'dien-thoai', 'laptop')
  category: z.string().optional(),
  // Cho phép lọc bằng ID 
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
