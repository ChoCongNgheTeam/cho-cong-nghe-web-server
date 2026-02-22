import { z } from "zod";

// Schema cho thêm vào database (logged-in only)
export const addToCartSchema = z.object({
  productVariantId: z.string().uuid("ID variant sản phẩm không hợp lệ"),
  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .positive("Số lượng phải lớn hơn 0"),
});

// Schema cho update database
export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .positive("Số lượng phải lớn hơn 0"),
});

// Schema cho params
export const cartItemParamsSchema = z.object({
  cartItemId: z.string().uuid("ID giỏ hàng không hợp lệ"),
});

// Schema cho validate 1 item từ localStorage
export const validateItemSchema = z.object({
  productVariantId: z.string().uuid("ID variant không hợp lệ"),
  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .positive("Số lượng phải lớn hơn 0")
    .max(100, "Số lượng tối đa là 100"),
});

// Schema cho localStorage cart item
const localStorageCartItemSchema = z.object({
  // 2 trường BẮT BUỘC để BE xử lý logic
  productVariantId: z.string().uuid("ID variant không hợp lệ"),
  quantity: z.coerce.number().int("Số lượng phải là số nguyên").positive("Số lượng phải > 0").max(100, "Tối đa 100"),
  
  // Các trường còn lại FE có thể gửi để map data nhưng KHÔNG BẮT BUỘC
  productId: z.string().uuid().optional(),
  productName: z.string().optional(),
  productSlug: z.string().optional(),
  brandName: z.string().optional(),
  variantCode: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  colorValue: z.string().optional(),
  unitPrice: z.coerce.number().positive().optional(),
  addedAt: z.coerce.number().optional(),
});

// Schema cho sync cart từ localStorage
export const syncCartSchema = z.object({
  items: z
    .array(localStorageCartItemSchema)
    .max(50, "Giỏ hàng chỉ chứa tối đa 50 sản phẩm"),
});

// Schema cho validate toàn bộ cart từ localStorage
export const validateLocalCartSchema = z.object({
  items: z
    .array(localStorageCartItemSchema)
    .max(50, "Giỏ hàng chỉ chứa tối đa 50 sản phẩm")
    .optional(),
});

// Export types
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ValidateItemInput = z.infer<typeof validateItemSchema>;
export type SyncCartInput = z.infer<typeof syncCartSchema>;
export type ValidateLocalCartInput = z.infer<typeof validateLocalCartSchema>;
export type LocalStorageCartItem = z.infer<typeof localStorageCartItemSchema>;