import { Response } from "express";
import prisma from "@/config/db";

/**
 * Tìm orderCode từ nhiều loại ref khác nhau.
 * Tách thành các query riêng vì Prisma strict UUID validation —
 * không thể dùng OR trên cùng 1 query khi các field có @db.Uuid type
 * mà value có thể không phải UUID format.
 */
export const redirectToFrontend = async (res: Response, ref: string): Promise<void> => {
  console.log("[redirectToFrontend] ref =", ref);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  console.log("[redirectToFrontend] frontendUrl =", frontendUrl);

  if (!ref) {
    res.redirect(`${frontendUrl}/account/orders`);
    return;
  }

  try {
    let orderCode: string | null = null;

    // 1. orderCode trực tiếp (format CCN-...)
    if (ref.startsWith("CCN")) {
      const order = await prisma.orders.findFirst({
        where: { orderCode: ref },
        select: { orderCode: true },
      });
      orderCode = order?.orderCode ?? null;
    }

    // 2. Stripe PaymentIntent ID (format pi_...)
    if (!orderCode && ref.startsWith("pi_")) {
      const order = await prisma.orders.findFirst({
        where: { stripePaymentIntentId: ref },
        select: { orderCode: true },
      });
      orderCode = order?.orderCode ?? null;
    }

    // 3. MoMo order ID (format MOMO...)
    if (!orderCode && ref.toUpperCase().startsWith("MOMO")) {
      const order = await prisma.orders.findFirst({
        where: { momoOrderId: ref },
        select: { orderCode: true },
      });
      orderCode = order?.orderCode ?? null;
    }

    // 4. ZaloPay app_trans_id (format YYMMDD_timestamp)
    if (!orderCode && /^\d{6}_\d+$/.test(ref)) {
      const order = await prisma.orders.findFirst({
        where: { zaloPayTransId: ref },
        select: { orderCode: true },
      });
      orderCode = order?.orderCode ?? null;
    }

    // 5. VNPay txnRef (format timestamp + orderCode snippet)
    if (!orderCode) {
      const order = await prisma.orders.findFirst({
        where: { vnpayTxnRef: ref },
        select: { orderCode: true },
      });
      orderCode = order?.orderCode ?? null;
    }

    // 6. UUID — order.id (last resort)
    if (!orderCode && /^[0-9a-f-]{36}$/.test(ref)) {
      const order = await prisma.orders.findFirst({
        where: { id: ref },
        select: { orderCode: true },
      });
      orderCode = order?.orderCode ?? null;
    }

    if (orderCode) {
      res.redirect(`${frontendUrl}/order/${orderCode}/payment`);
    } else {
      console.warn("[redirectToFrontend] Order not found for ref:", ref);
      res.redirect(`${frontendUrl}/account/orders`);
    }
  } catch (err) {
    console.error("[redirectToFrontend] DB error:", err);
    res.redirect(`${frontendUrl}/account/orders`);
  }
};
