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

// ✅ SePay thực tế webhook payload
export const sePayWebhookSchema = z.object({
  id: z.number(),
  gateway: z.string(), // "MBBank", "VietcomBank", ...
  transactionDate: z.string(),
  accountNumber: z.string(),
  subAccount: z.string().nullable().optional(),
  code: z.string().nullable().optional(), // SePay tự parse từ content
  content: z.string(), // Nội dung chuyển khoản
  transferType: z.enum(["in", "out"]),
  transferAmount: z.number(),
  accumulated: z.number().optional(),
  referenceCode: z.string().optional(), // Mã tham chiếu ngân hàng
  description: z.string().optional(),
  apiKey: z.string().optional(), // SePay gửi kèm để verify
});

export type SePayWebhookPayload = z.infer<typeof sePayWebhookSchema>;

// Legacy / internal schema (giữ lại nếu cần test manual)
export const webhookPayloadSchema = z
  .object({
    orderId: z.string().uuid("orderId không hợp lệ"),
    transactionRef: z.string().optional(),
    status: z.enum(["COMPLETED", "FAILED", "REFUNDED"]),
  })
  .passthrough();
