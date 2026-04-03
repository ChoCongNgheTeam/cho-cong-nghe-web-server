/**
 * Xử lý toàn bộ logic ZaloPay: tạo payment URL, callback (IPN), return handler.
 */

import { BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { redirectToFrontend } from "../../payment.service";

const hmacSha256 = (key: string, data: string): string => crypto.createHmac("sha256", key).update(data).digest("hex");

// ─── Create payment URL ───────────────────────────────────────────────────────
// ⚠️  Không còn gọi prisma.orders.update ở đây nữa.
//     appTransId được trả về → lưu vào DB trong executeOrderTransaction (atomic).

export const createZaloPayPaymentUrl = async (orderId: string, amount: number, description: string) => {
  const appId = Number(process.env.ZALOPAY_APP_ID!);
  const key1 = process.env.ZALOPAY_KEY1!;

  const transID = String(Date.now());
  const appTransId = `${new Date().toISOString().slice(2, 10).replace(/-/g, "")}_${transID}`;
  const appTime = Date.now();
  const appUser = "user123";
  const embedData = JSON.stringify({ redirecturl: process.env.ZALOPAY_REDIRECT_URL });
  const items = JSON.stringify([{}]);

  const rawSignature = `${appId}|${appTransId}|${appUser}|${amount}|${appTime}|${embedData}|${items}`;
  const mac = hmacSha256(key1, rawSignature);

  const body = {
    app_id: appId,
    app_trans_id: appTransId,
    app_user: appUser,
    app_time: appTime,
    item: items,
    embed_data: embedData,
    amount,
    description,
    bank_code: "",
    callback_url: process.env.ZALOPAY_CALLBACK_URL!,
    mac,
  };

  const { data } = await axios.post(process.env.ZALOPAY_API_URL!, body, {
    headers: { "Content-Type": "application/json" },
    timeout: 8000, // 8 giây timeout để tránh hang
  });

  if (data.return_code !== 1) {
    throw new BadRequestError(`ZaloPay error: ${data.return_message}`);
  }

  // Trả appTransId về để builder ghi vào paymentFields → lưu trong transaction
  return {
    paymentUrl: data.order_url,
    appTransId,
    zaloPayOrderToken: data.zp_trans_token,
  };
};

// ─── Callback handler (IPN từ ZaloPay — POST) ────────────────────────────────

export const handleZaloPayCallback = async (rawPayload: unknown) => {
  const key2 = process.env.ZALOPAY_KEY2!;
  const payload = rawPayload as { data: string; mac: string };

  const expectedMac = hmacSha256(key2, payload.data);
  if (expectedMac !== payload.mac) {
    return { return_code: -1, return_message: "MAC không hợp lệ" };
  }

  const data = JSON.parse(payload.data) as {
    zp_trans_id: number;
    app_trans_id: string;
    amount: number;
  };

  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: String(data.zp_trans_id) },
  });
  if (existed) return { return_code: 1, return_message: "Already processed" };

  const order = await prisma.orders.findFirst({
    where: { zaloPayTransId: data.app_trans_id },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });

  if (!order) {
    console.warn("[ZaloPay CB] Không tìm thấy order:", data.app_trans_id);
    return { return_code: 1, return_message: "Order not found" };
  }

  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: data.amount,
      transactionRef: String(data.zp_trans_id),
      status: "COMPLETED",
      payload: rawPayload as Prisma.InputJsonValue,
    },
  });

  if (order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
  }

  // console.log(`[ZaloPay CB] Order ${order.id} → PAID`);
  return { return_code: 1, return_message: "Thành công" };
};

// ─── Return handler ───────────────────────────────────────────────────────────

export const zaloPayReturnHandler = (req: Request, res: Response): void => {
  const { apptransid } = req.query as { apptransid: string };
  redirectToFrontend(res, apptransid);
};
