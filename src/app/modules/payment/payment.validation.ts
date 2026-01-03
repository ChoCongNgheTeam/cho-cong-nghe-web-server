import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1, "Tên phương thức thanh toán không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const webhookPayloadSchema = z
  .object({
    orderId: z.uuid("orderId không hợp lệ"),
    transactionRef: z.string().optional(),
    status: z.enum(["COMPLETED", "FAILED", "REFUNDED"]),
    // các field khác tuỳ ngân hàng, để optional
  })
  .passthrough(); // cho phép các field thừa từ ngân hàng
