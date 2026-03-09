import { z } from "zod";

export const getWishlistQuerySchema = z.object({
  page: z.string().optional().transform(Number).refine(val => val > 0, { message: "Page phải lớn hơn 0" }).catch(1),
  limit: z.string().optional().transform(Number).refine(val => val > 0, { message: "Limit phải lớn hơn 0" }).catch(10),
});

export const addToWishlistSchema = z.object({
  productId: z
    .string()
    .min(1, "ID sản phẩm không được để trống")
    .uuid("ID sản phẩm phải là UUID hợp lệ"),
});

export const removeFromWishlistSchema = z.object({
  productId: z
    .string()
    .min(1, "ID sản phẩm không được để trống")
    .uuid("ID sản phẩm phải là UUID hợp lệ"),
});

export const wishlistParamsSchema = z.object({
  productId: z
    .string()
    .uuid("ID sản phẩm phải là UUID hợp lệ"),
});