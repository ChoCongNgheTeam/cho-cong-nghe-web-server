/**
 *
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

// Stripe SDK instance (singleton)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create PaymentIntent
// FE dùng clientSecret này để khởi tạo Stripe Payment Element

export const createStripePaymentIntent = async (
  orderId: string,
  amount: number, // VND (số nguyên)
  currency: string = "vnd",
) => {
  // Stripe không nhân *100 với VND (zero-decimal currency)
  // Xem: https://stripe.com/docs/currencies#zero-decimal
  const stripeAmount = Math.round(amount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: stripeAmount,
    currency,
    metadata: { orderId },
    automatic_payment_methods: { enabled: true },
  });

  // Lưu stripePaymentIntentId vào order để webhook tìm lại
  await prisma.orders.update({
    where: { id: orderId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  };
};

// Webhook handler
// Stripe ký payload bằng STRIPE_WEBHOOK_SECRET → phải verify trước khi xử lý
// QUAN TRỌNG: route này cần dùng express.raw() thay vì express.json()

export const handleStripeWebhook = async (req: Request) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) throw new BadRequestError("Missing stripe-signature header");

  let event: Stripe.Event;

  try {
    // req.body phải là raw Buffer (không qua JSON.parse)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    throw new BadRequestError(`Stripe webhook signature invalid: ${err.message}`);
  }

  // Chỉ xử lý event thanh toán thành công
  if (event.type !== "payment_intent.succeeded" && event.type !== "payment_intent.payment_failed") {
    return { received: true, message: `Ignored event: ${event.type}` };
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const isSuccess = event.type === "payment_intent.succeeded";

  // Idempotency
  const existed = await prisma.payment_transactions.findFirst({
    where: { transactionRef: paymentIntent.id },
  });
  if (existed) {
    console.log("[Stripe Webhook] Duplicate event ignored:", paymentIntent.id);
    return { received: true, message: "Already processed" };
  }

  // Tìm order qua metadata.orderId (ưu tiên) hoặc stripePaymentIntentId
  const orderId = paymentIntent.metadata?.orderId;
  const order = await prisma.orders.findFirst({
    where: orderId ? { id: orderId } : { stripePaymentIntentId: paymentIntent.id },
    select: { id: true, totalAmount: true, paymentMethodId: true, paymentStatus: true },
  });

  if (!order) {
    console.warn("[Stripe Webhook] Order not found for PaymentIntent:", paymentIntent.id);
    return { received: true, message: "Order not found" };
  }

  const transactionStatus = isSuccess ? "COMPLETED" : "FAILED";
  // Stripe trả VND không nhân 100
  const receivedAmount = paymentIntent.amount;

  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: receivedAmount,
      transactionRef: paymentIntent.id,
      status: transactionStatus,
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

  return { received: true, orderId: order.id, transactionStatus };
};

// Return handler
// Stripe redirect FE về đây sau khi thanh toán (dù thành công hay thất bại)
// Logic thực tế đã xử lý ở webhook — handler này chỉ redirect FE

export const stripeReturnHandler = (req: Request, res: Response): void => {
  const { payment_intent } = req.query as { payment_intent: string };
  // Dùng paymentIntentId để FE query lại trạng thái nếu cần
  redirectToFrontend(res, payment_intent);
};
