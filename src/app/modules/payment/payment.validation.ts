/**
 * payment.validation.ts
 *
 * Tập trung toàn bộ Zod schemas cho payment module.
 */

import { z } from "zod";

// Payment Method CRUD

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1, "Tên phương thức thanh toán không được để trống"),
  code: z.string().min(1, "Mã phương thức thanh toán không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// SePay

export const sePayWebhookSchema = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string(),
  subAccount: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  content: z.string(),
  transferType: z.enum(["in", "out"]),
  transferAmount: z.number(),
  accumulated: z.number().optional(),
  referenceCode: z.string().optional(),
  description: z.string().optional(),
  apiKey: z.string().optional(),
});

export type SePayWebhookPayload = z.infer<typeof sePayWebhookSchema>;

// MoMo

export const momoIpnSchema = z
  .object({
    partnerCode: z.string(),
    orderId: z.string(),
    requestId: z.string(),
    amount: z.number(),
    orderInfo: z.string(),
    orderType: z.string(),
    transId: z.number(),
    resultCode: z.number(), // 0 = success
    message: z.string(),
    payType: z.string().optional(),
    responseTime: z.number(),
    extraData: z.string().optional(),
    signature: z.string(),
  })
  .passthrough();

export type MomoIpnPayload = z.infer<typeof momoIpnSchema>;

// Create-payment request bodies
// Lưu ý: `amount` chỉ giữ lại để tương thích FE cũ gửi lên — server luôn tự tính
// lại amount từ order.totalAmount trong DB, không dùng giá trị client gửi để tính tiền.

const orderIdField = z.string().uuid("orderId không hợp lệ");

export const createMomoPaymentSchema = z.object({
  orderId: orderIdField,
  amount: z.number().positive().optional(),
  orderInfo: z.string().min(1, "orderInfo không được để trống"),
});
export type CreateMomoPaymentInput = z.infer<typeof createMomoPaymentSchema>;

export const createVnpayPaymentSchema = z.object({
  orderId: orderIdField,
  amount: z.number().positive().optional(),
  orderInfo: z.string().min(1, "orderInfo không được để trống"),
});
export type CreateVnpayPaymentInput = z.infer<typeof createVnpayPaymentSchema>;

export const createZaloPayPaymentSchema = z.object({
  orderId: orderIdField,
  amount: z.number().positive().optional(),
  description: z.string().min(1, "description không được để trống"),
});
export type CreateZaloPayPaymentInput = z.infer<typeof createZaloPayPaymentSchema>;

export const createStripePaymentSchema = z.object({
  orderId: orderIdField,
  amount: z.number().positive().optional(),
});
export type CreateStripePaymentInput = z.infer<typeof createStripePaymentSchema>;
