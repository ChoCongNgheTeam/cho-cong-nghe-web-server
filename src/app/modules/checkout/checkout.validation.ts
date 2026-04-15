import { z } from "zod";

// Schema cho API GET /checkout/validate
export const validateCheckoutQuerySchema = z.object({
  cartItemIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
});

// POST /checkout body
export const checkoutSchema = z.object({
  paymentMethodId: z.string().uuid("ID phương thức thanh toán không hợp lệ"),
  shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ"),
  voucherId: z
    .string()
    .uuid("ID voucher không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  cartItemIds: z
    .array(z.string().uuid("ID sản phẩm trong giỏ không hợp lệ"))
    .min(1, "Vui lòng chọn ít nhất 1 sản phẩm")
    .optional(),
});

// GET /checkout/preview query params
export const checkoutPreviewSchema = z.object({
  paymentMethodId: z.string().uuid("ID phương thức thanh toán không hợp lệ"),
  shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ"),
  voucherId: z
    .string()
    .uuid("ID voucher không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  cartItemIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewSchema>;