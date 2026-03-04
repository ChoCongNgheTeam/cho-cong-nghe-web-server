import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getAllPaymentMethodsHandler,
  getActivePaymentMethodsHandler,
  createPaymentMethodHandler,
  updatePaymentMethodHandler,
  deletePaymentMethodHandler,
  sepayWebhookHandler,
  createMomoPaymentHandler,
  momoWebhookHandler,
  momoReturnHandler,
  createVnpayPaymentHandler,
  vnpayWebhookHandler,
  vnpayReturnHandler,
  createZaloPayPaymentHandler,
  zaloPayCallbackHandler,
  zaloPayReturnHandler,
  createStripePaymentHandler,
  stripeReturnHandler,
} from "./payment.controller";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./payment.validation";

const router = Router();

// Public — FE dùng để render select
router.get("/active", asyncHandler(getActivePaymentMethodsHandler));

// Admin CRUD
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), asyncHandler(getAllPaymentMethodsHandler));
router.post("/admin", authMiddleware(), requireRole("ADMIN"), validate(createPaymentMethodSchema), asyncHandler(createPaymentMethodHandler));
router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(updatePaymentMethodSchema), asyncHandler(updatePaymentMethodHandler));
router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), asyncHandler(deletePaymentMethodHandler));

// SePay (bank transfer)

router.post("/webhook/sepay", asyncHandler(sepayWebhookHandler));

// MoMo

router.post("/momo/create", authMiddleware(), asyncHandler(createMomoPaymentHandler));
router.post("/webhook/momo", asyncHandler(momoWebhookHandler)); // MoMo IPN — public
router.get("/momo/return", asyncHandler(momoReturnHandler));

// VNPay

router.post("/vnpay/create", authMiddleware(), asyncHandler(createVnpayPaymentHandler));
router.get("/webhook/vnpay", asyncHandler(vnpayWebhookHandler)); // VNPay IPN — GET — public
router.get("/vnpay/return", asyncHandler(vnpayReturnHandler));

// ZaloPay

router.post("/zalopay/create", authMiddleware(), asyncHandler(createZaloPayPaymentHandler));
router.post("/webhook/zalopay", asyncHandler(zaloPayCallbackHandler)); // ZaloPay POST callback
router.get("/zalopay/return", asyncHandler(zaloPayReturnHandler));

// Stripe Payment Element — FE gọi để lấy clientSecret
router.post("/stripe/create", authMiddleware(), asyncHandler(createStripePaymentHandler));

// Stripe Return URL — Stripe redirect FE về đây
router.get("/stripe/return", asyncHandler(stripeReturnHandler));

export default router;
