/**
 * Xử lý toàn bộ logic MoMo: tạo payment URL (sandbox) và xử lý IPN.
 */

import { BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { momoIpnSchema } from "../../payment.validation";
import { redirectToFrontend } from "../../payment.service";

// Signature helpers
const buildMomoSignature = (rawStr: string): string => crypto.createHmac("sha256", process.env.MOMO_SECRET_KEY!).update(rawStr).digest("hex");

// ─── Create payment URL (sandbox) ────────────────────────────────────────────
// ⚠️  Không còn gọi prisma.orders.update ở đây nữa.
//     momoOrderId được trả về → lưu vào DB trong executeOrderTransaction (atomic).

export const createMomoPaymentUrl = async (orderId: string, amount: number, orderInfo: string) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE!;
  const accessKey = process.env.MOMO_ACCESS_KEY!;
  const redirectUrl = process.env.MOMO_REDIRECT_URL!;
  const ipnUrl = process.env.MOMO_IPN_URL!;
  const requestType = "payWithMethod";
  const extraData = "";
  const autoCapture = true;
  const lang = "vi";

  // MoMo sandbox yêu cầu: orderId = partnerCode + timestamp
  const momoOrderId = `${partnerCode}${Date.now()}`;
  const requestId = momoOrderId;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${momoOrderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const signature = buildMomoSignature(rawSignature);

  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId,
    amount: String(amount), // sandbox cần string
    orderId: momoOrderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId: "",
    signature,
  });

  const { data } = await axios.post(process.env.MOMO_API_URL!, requestBody, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    timeout: 8000, // 8 giây timeout để tránh hang
  });

  if (data.resultCode !== 0) {
    throw new BadRequestError(`MoMo error: ${data.message}`);
  }

  // Trả momoOrderId về để builder ghi vào paymentFields → lưu trong transaction
  return {
    paymentUrl: data.payUrl,
    momoOrderId,
    shortLink: data.shortLink,
  };
};

// ─── Return handler (redirect FE, không xử lý logic) ─────────────────────────

export const momoReturnHandler = (req: Request, res: Response): void => {
  const { orderId } = req.query as { orderId: string };
  redirectToFrontend(res, orderId);
};

// ─── IPN handler ──────────────────────────────────────────────────────────────

export const handleMomoIpn = async (rawPayload: unknown) => {
  const payload = momoIpnSchema.parse(rawPayload);

  // 1. Verify signature
  const rawSignature =
    `accessKey=${process.env.MOMO_ACCESS_KEY!}` +
    `&amount=${payload.amount}` +
    `&extraData=${payload.extraData ?? ""}` +
    `&message=${payload.message}` +
    `&orderId=${payload.orderId}` +
    `&orderInfo=${payload.orderInfo}` +
    `&orderType=${payload.orderType}` +
    `&partnerCode=${payload.partnerCode}` +
    `&payType=${payload.payType ?? ""}` +
    `&requestId=${payload.requestId}` +
    `&responseTime=${payload.responseTime}` +
    `&resultCode=${payload.resultCode}` +
    `&transId=${payload.transId}`;

  if (payload.signature !== buildMomoSignature(rawSignature)) {
    throw new BadRequestError("Chữ ký MoMo không hợp lệ");
  }

  // 2. Idempotency
  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: String(payload.transId) },
  });
  if (existed) return { success: true, message: "Already processed" };

  // 3. Tìm order theo momoOrderId
  const order = await prisma.orders.findFirst({
    where: { momoOrderId: payload.orderId },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });

  if (!order) {
    console.warn("[MoMo IPN] Không tìm thấy order:", payload.orderId);
    return { success: true, message: "Order not found" };
  }

  // 4. Tạo transaction
  const isSuccess = payload.resultCode === 0;
  const transactionStatus = isSuccess ? "COMPLETED" : "FAILED";

  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: payload.amount,
      transactionRef: String(payload.transId),
      status: transactionStatus,
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  // 5. Update order
  if (isSuccess && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
  }

  const newPaymentStatus = isSuccess ? "PAID" : "UNPAID";
  // console.log(`[MoMo IPN] Order ${order.id} → ${newPaymentStatus}`);

  return { success: true, orderId: order.id, transactionStatus, newPaymentStatus };
};
