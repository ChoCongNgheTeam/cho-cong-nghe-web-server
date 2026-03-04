/**
 *
 * Xử lý toàn bộ logic liên quan đến SePay (bank transfer webhook).
 */

import { BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { PaymentTransactionStatus, Prisma } from "@prisma/client";
import { IncomingHttpHeaders } from "http";
import { SePayWebhookPayload, sePayWebhookSchema } from "../../payment.validation";

// Verify

/**
 * Xác thực API key từ header Authorization và kiểm tra loại giao dịch.
 * SePay gửi header: "Authorization: Apikey <key>"
 */
const verifySePay = (headers: IncomingHttpHeaders, payload: SePayWebhookPayload): void => {
  const apiKey = headers.authorization?.replace("Apikey ", "");

  if (process.env.SEPAY_API_KEY && apiKey !== process.env.SEPAY_API_KEY) {
    throw new BadRequestError("API key không hợp lệ");
  }

  // Chỉ xử lý giao dịch chuyển vào
  if (payload.transferType !== "in") {
    throw new BadRequestError("Bỏ qua giao dịch chuyển ra");
  }
};

// Order matching

/**
 * Tìm order UNPAID dựa trên nội dung chuyển khoản có chứa bankTransferCode.
 * Convention: nội dung CK phải chứa bankTransferCode, ví dụ "Thanh toan DH-ABC123".
 *
 * NOTE: Nếu số lượng đơn pending lớn, cân nhắc index bankTransferCode ở DB
 * và dùng raw query ILIKE thay vì filter ở application layer.
 */
const findOrderByTransferContent = async (content: string) => {
  const pendingOrders = await prisma.orders.findMany({
    where: {
      paymentStatus: "UNPAID",
      bankTransferCode: { not: null },
    },
    select: {
      id: true,
      paymentStatus: true,
      totalAmount: true,
      paymentMethodId: true,
      bankTransferCode: true,
    },
  });

  const contentUpper = content.toUpperCase();
  return pendingOrders.find((o) => o.bankTransferCode && contentUpper.includes(o.bankTransferCode.toUpperCase())) ?? null;
};

// Determine transaction status

const resolveTransactionStatus = (received: number, expected: number): PaymentTransactionStatus => {
  if (received === expected) return "COMPLETED";
  if (received < expected) return "UNDERPAID";
  return "OVERPAID";
};

// Main handler

export const handleSePayWebhook = async (rawPayload: unknown, headers: IncomingHttpHeaders) => {
  const payload = sePayWebhookSchema.parse(rawPayload);

  verifySePay(headers, payload);

  // Idempotency: SePay có thể gửi lại nhiều lần
  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: payload.referenceCode },
  });
  if (existed) {
    console.log("[SePay] Duplicate webhook ignored:", payload.referenceCode);
    return { success: true, message: "Already processed" };
  }

  // Match order
  const order = await findOrderByTransferContent(payload.content);
  if (!order) {
    // Không throw để SePay không retry spam
    console.warn("[SePay] Không tìm thấy order cho content:", payload.content);
    return { success: true, message: "Không khớp đơn hàng nào" };
  }

  if (!order.paymentMethodId) {
    throw new BadRequestError("Order chưa có payment method");
  }

  const expectedAmount = Number(order.totalAmount);
  const receivedAmount = Number(payload.transferAmount);
  const transactionStatus = resolveTransactionStatus(receivedAmount, expectedAmount);

  // Tạo transaction mới (1 order → N transactions, hỗ trợ thanh toán nhiều lần)
  const transaction = await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId,
      amount: receivedAmount,
      transactionRef: payload.referenceCode,
      status: transactionStatus,
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  // Tính tổng tiền COMPLETED của order
  const { _sum } = await prisma.payment_transactions.aggregate({
    _sum: { amount: true },
    where: { orderId: order.id, status: "COMPLETED" },
  });
  const totalPaid = Number(_sum.amount ?? 0);

  // Cập nhật order nếu đã đủ tiền
  let newPaymentStatus = order.paymentStatus;
  if (totalPaid >= expectedAmount && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
    newPaymentStatus = "PAID";
    console.log(`[SePay] Order ${order.id} PAID. TotalPaid=${totalPaid}`);
  } else {
    console.log(`[SePay] Order ${order.id} chưa đủ tiền. Paid=${totalPaid}/${expectedAmount}`);
  }

  return {
    success: true,
    orderId: order.id,
    transactionId: transaction.id,
    transactionStatus,
    totalPaid,
    expectedAmount,
    newPaymentStatus,
  };
};
