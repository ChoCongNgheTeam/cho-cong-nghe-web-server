import { z } from "zod";

export const addToWishlistSchema = z.object({
  productVariantId: z
    .string()
    .min(1, "ID biến thể sản phẩm không được để trống")
    .uuid("ID biến thể sản phẩm phải là UUID hợp lệ"),
});

export const removeFromWishlistSchema = z.object({
  productVariantId: z
    .string()
    .min(1, "ID biến thể sản phẩm không được để trống")
    .uuid("ID biến thể sản phẩm phải là UUID hợp lệ"),
});

export const wishlistParamsSchema = z.object({
  productVariantId: z
    .string()
    .uuid("ID biến thể sản phẩm phải là UUID hợp lệ"),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type RemoveFromWishlistInput = z.infer<typeof removeFromWishlistSchema>;
