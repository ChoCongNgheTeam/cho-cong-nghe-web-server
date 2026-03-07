/**
 *
 * Xử lý toàn bộ logic VNPay: tạo payment URL, IPN (GET), return handler.
 */

import { BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { VNPay, HashAlgorithm } from "vnpay";
import { redirectToFrontend } from "../../payment.service";

// VNPay SDK instance (singleton)

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE!,
  secureSecret: process.env.VNPAY_HASH_SECRET!,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
});

// Helpers

/**
 * Lấy IP thực từ request, convert IPv6 loopback → IPv4.
 */
export const getClientIp = (req: Request): string => {
  const raw = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "127.0.0.1";
  return raw === "::1" ? "127.0.0.1" : raw.replace(/^::ffff:/, "");
};

// Create payment URL

export const createVnpayPaymentUrl = async (orderId: string, amount: number, orderInfo: string, ipAddr: string) => {
  // txnRef phải unique; dùng timestamp + 8 ký tự đầu của orderId (bỏ dấu -)
  const txnRef = `${Date.now()}${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
  });

  await prisma.orders.update({
    where: { id: orderId },
    data: { vnpayTxnRef: txnRef },
  });

  return { paymentUrl, txnRef };
};

// IPN handler (GET)

export const handleVnpayIpn = async (rawQuery: unknown) => {
  const verify = vnpay.verifyReturnUrl(rawQuery as any);

  if (!verify.isVerified) {
    console.warn("[VNPay IPN] Signature invalid");
    return { RspCode: "97", Message: "Invalid signature" };
  }

  const query = rawQuery as Record<string, string>;

  // Idempotency
  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: query.vnp_TransactionNo },
  });
  if (existed) return { RspCode: "00", Message: "Already processed" };

  // Tìm order
  const order = await prisma.orders.findFirst({
    where: { vnpayTxnRef: query.vnp_TxnRef },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });
  if (!order) return { RspCode: "01", Message: "Order not found" };

  // Kiểm tra số tiền: VNPay gửi amount * 100
  const receivedAmount = Number(query.vnp_Amount) / 100;
  const expectedAmount = Number(order.totalAmount);
  if (receivedAmount !== expectedAmount) {
    return { RspCode: "04", Message: "Invalid amount" };
  }

  const isSuccess = verify.isSuccess;
  const transactionStatus = isSuccess ? "COMPLETED" : "FAILED";

  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: receivedAmount,
      transactionRef: query.vnp_TransactionNo,
      status: transactionStatus,
      payload: rawQuery as Prisma.InputJsonValue,
    },
  });

  if (isSuccess && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
  }

  return { RspCode: "00", Message: "Confirm Success" };
};

// Return handler (redirect FE, không xử lý logic)

export const vnpayReturnHandler = (req: Request, res: Response): void => {
  // Verify chỉ để log/debug — không dùng để quyết định UI
  // Kết quả thực tế đã được xử lý ở IPN
  const verified = vnpay.verifyReturnUrl(req.query as any);
  console.log("[VNPay Return] verified:", verified.isVerified, verified.isSuccess);

  const txnRef = req.query.vnp_TxnRef as string;
  redirectToFrontend(res, txnRef);
};
