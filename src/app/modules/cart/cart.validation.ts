import { z } from "zod";

export const addToCartSchema = z.object({
  productVariantId: z.string().uuid("ID variant sản phẩm không hợp lệ"),
  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .positive("Số lượng phải lớn hơn 0"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .positive("Số lượng phải lớn hơn 0"),
});

export const cartItemParamsSchema = z.object({
  cartItemId: z.string().uuid("ID giỏ hàng không hợp lệ"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
