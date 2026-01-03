import { NotFoundError, BadRequestError } from "@/utils/errors";
import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import {
  findPaymentMethodById,
  createPaymentTransaction,
  findTransactionByOrderId,
} from "./payment.repository";
import { webhookPayloadSchema } from "./payment.validation";

export const getActivePaymentMethods = async () => {
  return prisma.payment_methods.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
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
  const newPaymentStatus =
    status === "COMPLETED" ? "PAID" : status === "REFUNDED" ? "REFUNDED" : "UNPAID";

  await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: newPaymentStatus },
  });

  return { success: true, orderId, newPaymentStatus };
};
