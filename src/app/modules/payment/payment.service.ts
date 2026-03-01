import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { PaymentTransactionStatus, Prisma } from "@prisma/client";
import { findPaymentMethodById, createPaymentTransaction, findTransactionByOrderId } from "./payment.repository";
import { SePayWebhookPayload, sePayWebhookSchema, webhookPayloadSchema } from "./payment.validation";
import { IncomingHttpHeaders } from "http";

export const getActivePaymentMethods = async () => {
  return prisma.payment_methods.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
};

const SEPAY_API_KEY = process.env.SEPAY_API_KEY;

const verifySePay = (headers: IncomingHttpHeaders, payload: SePayWebhookPayload) => {
  const authHeader = headers.authorization;

  const apiKey = authHeader?.replace("Apikey ", "");

  // console.log("Header API key:", apiKey);

  if (process.env.SEPAY_API_KEY && apiKey !== process.env.SEPAY_API_KEY) {
    throw new BadRequestError("API key không hợp lệ");
  }

  if (payload.transferType !== "in") {
    throw new BadRequestError("Bỏ qua giao dịch chuyển ra");
  }
};

// Tìm order từ nội dung chuyển khoản
// Convention: nội dung CK phải chứa bankTransferCode của order
// VD: "Thanh toan DH-ABC123" → tìm order có bankTransferCode = "DH-ABC123"
const findOrderByTransferContent = async (content: string) => {
  // Lấy tất cả orders đang chờ thanh toán có bankTransferCode
  // Rồi check xem content có chứa code không

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

// export const handleSePayWebhook = async (rawPayload: unknown) => {
//   // 1. Validate payload
//   const payload = sePayWebhookSchema.parse(rawPayload);

//   // 2. Verify
//   verifySePay(payload);

//   // 3. Tìm order khớp với nội dung CK
//   const order = await findOrderByTransferContent(payload.content);

//   if (!order) {
//     // Không tìm thấy order → log lại nhưng không throw (tránh SePay retry)
//     console.warn("[SePay Webhook] Không tìm thấy order cho content:", payload.content);
//     return { success: true, message: "Giao dịch không khớp đơn hàng nào" };
//   }

//   // 4. Kiểm tra số tiền (optional nhưng nên có)
//   const expectedAmount = Number(order.totalAmount);
//   const receivedAmount = payload.transferAmount;

//   let paymentStatus: "PAID" | "UNDERPAID" | "OVERPAID";

//   if (receivedAmount === expectedAmount) {
//     paymentStatus = "PAID";
//   } else if (receivedAmount < expectedAmount) {
//     paymentStatus = "UNDERPAID";
//   } else {
//     paymentStatus = "OVERPAID";
//   }

//   if (payload.transferAmount < expectedAmount) {
//     console.warn(`[SePay Webhook] Order ${order.id}: nhận ${payload.transferAmount}, cần ${expectedAmount}`);
//     // Tùy business: có thể reject hoặc vẫn ghi nhận
//   }

//   // 5. Tìm hoặc tạo transaction
//   if (!order.paymentMethodId) {
//     throw new BadRequestError("Đơn hàng chưa có phương thức thanh toán");
//   }

//   let transaction = await findTransactionByOrderId(order.id);

//   if (!transaction) {
//     transaction = await createPaymentTransaction({
//       orderId: order.id,
//       paymentMethodId: order.paymentMethodId,
//       amount: order.totalAmount,
//       transactionRef: payload.referenceCode,
//       status: "PENDING",
//       payload: rawPayload as Prisma.InputJsonValue,
//     });
//   }

//   if (!transaction) throw new Error("Không thể tạo giao dịch");

//   const existed = await prisma.payment_transactions.findFirst({
//     where: {
//       transactionRef: payload.referenceCode,
//     },
//   });

//   if (existed) {
//     return { success: true, message: "Already processed" };
//   }

//   // 6. Cập nhật transaction → COMPLETED
//   await prisma.payment_transactions.update({
//     where: { id: transaction.id },
//     data: {
//       status: paymentStatus === "PAID" ? "COMPLETED" : "PENDING",
//       transactionRef: payload.referenceCode ?? transaction.transactionRef,
//       payload: rawPayload as Prisma.InputJsonValue,
//     },
//   });

//   // 7. Cập nhật order → PAID
//   await prisma.orders.update({
//     where: { id: order.id },
//     data: { paymentStatus: "PAID" },
//   });

//   console.log(`[SePay Webhook] Order ${order.id} đã thanh toán thành công. Ref: ${payload.referenceCode}`);

//   return {
//     success: true,
//     orderId: order.id,
//     newPaymentStatus: "PAID",
//     transferAmount: payload.transferAmount,
//   };
// };

export const handleSePayWebhook = async (rawPayload: unknown, headers: IncomingHttpHeaders) => {
  const payload = sePayWebhookSchema.parse(rawPayload);

  verifySePay(headers, payload);
  /**
   * Idempotency check
   * (SePay có thể gửi webhook nhiều lần)
   */
  const existed = await prisma.payment_transactions.findFirst({
    where: {
      transactionRef: payload.referenceCode,
    },
  });

  if (existed) {
    console.log("[SePay Webhook] Duplicate webhook ignored:", payload.referenceCode);
    return { success: true, message: "Already processed" };
  }

  /**
   * Find order bằng nội dung chuyển khoản
   */
  const order = await findOrderByTransferContent(payload.content);

  if (!order) {
    console.warn("[SePay Webhook] Không tìm thấy order cho content:", payload.content);

    // Không throw để tránh SePay retry spam
    return {
      success: true,
      message: "Không khớp đơn hàng nào",
    };
  }

  if (!order.paymentMethodId) {
    throw new BadRequestError("Order chưa có payment method");
  }

  /**
   * Evaluate payment amount
   */
  const expectedAmount = Number(order.totalAmount);
  const receivedAmount = Number(payload.transferAmount);

  let transactionStatus: PaymentTransactionStatus;

  if (receivedAmount === expectedAmount) {
    transactionStatus = "COMPLETED";
  } else if (receivedAmount < expectedAmount) {
    transactionStatus = "UNDERPAID";
  } else {
    transactionStatus = "OVERPAID";
  }

  /**
   * CREATE NEW TRANSACTION (1 → N)
   *  KHÔNG update transaction cũ
   */
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

  /**
   * Tính tổng tiền đã thanh toán
   * (support nhiều lần chuyển tiền)
   */
  const paidAggregation = await prisma.payment_transactions.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      orderId: order.id,
      status: "COMPLETED",
    },
  });

  const totalPaid = Number(paidAggregation._sum.amount ?? 0);

  /**
   * Update order nếu đã đủ tiền
   */
  let newPaymentStatus = order.paymentStatus;

  if (totalPaid >= expectedAmount && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
      },
    });

    newPaymentStatus = "PAID";

    console.log(`[SePay Webhook] Order ${order.id} đã thanh toán đủ. TotalPaid=${totalPaid}`);
  } else {
    console.log(`[SePay Webhook] Order ${order.id} chưa đủ tiền. Paid=${totalPaid}/${expectedAmount}`);
  }

  /**
   * Done
   */
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

// Webhook handler logic (fake verify)
export const handlePaymentWebhook = async (rawPayload: any) => {
  // 1. Validate payload cơ bản
  const payload = webhookPayloadSchema.parse(rawPayload);

  const { orderId, status } = payload;

  // 2. Kiểm tra order tồn tại
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true, totalAmount: true, paymentMethodId: true },
  });

  if (!order) throw new NotFoundError("Đơn hàng");

  // 3. Tạo/lấy transaction
  let transaction = await findTransactionByOrderId(orderId);

  if (!transaction) {
    if (!order.paymentMethodId) {
      throw new BadRequestError("Đơn hàng chưa có phương thức thanh toán");
    }

    const paymentMethod = await findPaymentMethodById(order.paymentMethodId);
    if (!paymentMethod) throw new NotFoundError("Phương thức thanh toán");

    transaction = await createPaymentTransaction({
      orderId,
      paymentMethodId: order.paymentMethodId,
      amount: order.totalAmount,
      transactionRef: payload.transactionRef,
      status: "PENDING",
      payload: rawPayload as Prisma.InputJsonValue,
    });
  }

  if (!transaction) {
    throw new Error("Không thể tạo giao dịch thanh toán");
  }

  // 4. Cập nhật transaction status
  await prisma.payment_transactions.update({
    where: { id: transaction.id },
    data: {
      status: status === "COMPLETED" ? "COMPLETED" : status === "REFUNDED" ? "REFUNDED" : "FAILED",
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  // 5. Cập nhật order paymentStatus
  const newPaymentStatus = status === "COMPLETED" ? "PAID" : status === "REFUNDED" ? "REFUNDED" : "UNPAID";

  await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: newPaymentStatus },
  });

  return { success: true, orderId, newPaymentStatus };
};
