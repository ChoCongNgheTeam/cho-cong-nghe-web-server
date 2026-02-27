import { z } from "zod";

export const updateOrderAdminSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
  shippingFee: z.number().min(0).optional(),
  voucherDiscount: z.number().min(0).optional(),
});

export type UpdateOrderAdminInput = z.infer<typeof updateOrderAdminSchema>;