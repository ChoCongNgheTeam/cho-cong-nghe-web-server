import { z } from "zod";

export const createOrderSchema = z.object({
  userId: z.uuid("ID người dùng không hợp lệ"),
  paymentMethodId: z.uuid("Phương thức thanh toán không hợp lệ"),
  voucherId: z.uuid().optional().or(z.literal("")),
  shippingAddressId: z.uuid("Địa chỉ giao hàng không hợp lệ"),
  orderItems: z
    .array(
      z.object({
        productVariantId: z.uuid("ID biến thể sản phẩm không hợp lệ"),
        quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
      })
    )
    .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export const updateOrderAdminSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
  shippingFee: z.number().min(0).optional(),
  voucherDiscount: z.number().min(0).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderAdminInput = z.infer<typeof updateOrderAdminSchema>;
