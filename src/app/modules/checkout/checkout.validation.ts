import { z } from "zod";

// POST /checkout body

export const checkoutSchema = z.object({
  paymentMethodId: z.string().uuid("ID phương thức thanh toán không hợp lệ"),
  shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ"),
  // Normalize: empty string → undefined
  voucherId: z
    .string()
    .uuid("ID voucher không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// GET /checkout/preview query params

export const checkoutPreviewSchema = z.object({
  paymentMethodId: z.string().uuid("ID phương thức thanh toán không hợp lệ"),
  shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ"),
  voucherId: z
    .string()
    .uuid("ID voucher không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewSchema>;
