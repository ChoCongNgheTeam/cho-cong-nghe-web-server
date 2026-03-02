import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1, "Tên phương thức thanh toán không được để trống"),
  code: z.string().min(1, "Mã phương thức thanh toán không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

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

// MoMo IPN payload
export const momoIpnSchema = z
  .object({
    partnerCode: z.string(),
    orderId: z.string(), // Chính là momoOrderId ta tự tạo
    requestId: z.string(),
    amount: z.number(),
    orderInfo: z.string(),
    orderType: z.string(),
    transId: z.number(), // Mã giao dịch MoMo
    resultCode: z.number(), // 0 = success
    message: z.string(),
    payType: z.string().optional(),
    responseTime: z.number(),
    extraData: z.string().optional(),
    signature: z.string(),
  })
  .passthrough();

// VNPay IPN query params
export const vnpayIpnSchema = z
  .object({
    vnp_TmnCode: z.string(),
    vnp_Amount: z.string(), // Số tiền * 100
    vnp_BankCode: z.string().optional(),
    vnp_BankTranNo: z.string().optional(),
    vnp_CardType: z.string().optional(),
    vnp_PayDate: z.string(),
    vnp_CurrCode: z.string().optional(),
    vnp_OrderInfo: z.string(),
    vnp_TransactionNo: z.string(),
    vnp_ResponseCode: z.string(), // "00" = success
    vnp_TransactionStatus: z.string(),
    vnp_TxnRef: z.string(), // Chính là vnpayTxnRef ta tự tạo
    vnp_SecureHash: z.string(),
  })
  .passthrough();

export type SePayWebhookPayload = z.infer<typeof sePayWebhookSchema>;
export type MomoIpnPayload = z.infer<typeof momoIpnSchema>;
export type VnpayIpnPayload = z.infer<typeof vnpayIpnSchema>;

// Legacy / internal schema (giữ lại nếu cần test manual)
export const webhookPayloadSchema = z
  .object({
    orderId: z.string().uuid("orderId không hợp lệ"),
    transactionRef: z.string().optional(),
    status: z.enum(["COMPLETED", "FAILED", "REFUNDED"]),
  })
  .passthrough();
