import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethodId: z
    .string()
    .uuid("ID phương thức thanh toán không hợp lệ"),
  shippingAddressId: z
    .string()
    .uuid("ID địa chỉ giao hàng không hợp lệ"),
  voucherId: z
    .string()
    .uuid("ID voucher không hợp lệ")
    .optional()
    .or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
