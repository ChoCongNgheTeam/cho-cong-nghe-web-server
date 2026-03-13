/**
 * Xử lý toàn bộ logic Stripe Payment Element:
 * - Tạo PaymentIntent (FE dùng clientSecret để render Payment Element)
 * - Verify webhook (Stripe gọi về sau khi thanh toán)
 * - Return handler (FE redirect về sau khi thanh toán)
 */

import { BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import Stripe from "stripe";
import { redirectToFrontend } from "../../payment.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ─── Create PaymentIntent ─────────────────────────────────────────────────────
// ⚠️  Không còn gọi prisma.orders.update ở đây nữa.
//     paymentIntentId được trả về → lưu vào DB trong executeOrderTransaction (atomic).

export const createStripePaymentIntent = async (orderId: string, amount: number, currency: string = "vnd") => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency,
    metadata: { orderId },
    automatic_payment_methods: { enabled: true },
  });

  // Trả paymentIntentId về để builder ghi vào paymentFields → lưu trong transaction
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  };
};

// ─── Webhook handler ──────────────────────────────────────────────────────────

export const handleStripeWebhook = async (req: Request) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) throw new BadRequestError("Missing stripe-signature header");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    throw new BadRequestError(`Stripe webhook signature invalid: ${err.message}`);
  }

  if (event.type !== "payment_intent.succeeded" && event.type !== "payment_intent.payment_failed") {
    return { received: true, message: `Ignored event: ${event.type}` };
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const isSuccess = event.type === "payment_intent.succeeded";

  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: paymentIntent.id },
  });
  if (existed) return { received: true, message: "Already processed" };

  const order = await prisma.orders.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });

  if (!order) {
    console.warn("[Stripe Webhook] Order not found for PaymentIntent:", paymentIntent.id);
    return { received: true, message: "Order not found" };
  }

  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: paymentIntent.amount,
      transactionRef: paymentIntent.id,
      status: isSuccess ? "COMPLETED" : "FAILED",
      payload: paymentIntent as unknown as Prisma.InputJsonValue,
    },
  });

  if (isSuccess && order.paymentStatus !== "PAID") {
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });
    console.log(`[Stripe Webhook] Order ${order.id} → PAID`);
  }

  return { received: true, orderId: order.id, transactionStatus: isSuccess ? "COMPLETED" : "FAILED" };
};

// ─── Return handler ───────────────────────────────────────────────────────────
// Stripe redirect FE về đây sau khi confirmPayment (dù thành công hay thất bại).
// Dùng payment_intent ID để tìm orderCode → redirect /order/{orderCode}/payment.
// Logic update paymentStatus PAID được xử lý ở webhook (handleStripeWebhook).

export const stripeReturnHandler = async (req: Request, res: Response): Promise<void> => {
  const { payment_intent } = req.query as { payment_intent: string };
  await redirectToFrontend(res, payment_intent ?? "");
};
