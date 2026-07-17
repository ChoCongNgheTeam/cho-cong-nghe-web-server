import express, { Router } from "express";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
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
  stripeWebhookHandler,
  stripeReturnHandler,
} from "./payment.controller";
import { createPaymentMethodSchema, updatePaymentMethodSchema, createMomoPaymentSchema, createVnpayPaymentSchema, createZaloPayPaymentSchema, createStripePaymentSchema } from "./payment.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/active", asyncHandler(getActivePaymentMethodsHandler));

// Admin CRUD — cấu hình payment method
// ACCOUNTING có canPaymentView — chỉ xem
// ADMIN full CRUD
router.get("/admin/all", ...staffAdminAuth, requirePermission("canPaymentView"), asyncHandler(getAllPaymentMethodsHandler));
router.post("/admin", ...adminAuth, validate(createPaymentMethodSchema), asyncHandler(createPaymentMethodHandler));
router.patch("/admin/:id", ...adminAuth, validate(updatePaymentMethodSchema), asyncHandler(updatePaymentMethodHandler));
router.delete("/admin/:id", ...adminAuth, asyncHandler(deletePaymentMethodHandler));

// Webhooks — public (từ payment gateway gọi vào)
router.post("/webhook/sepay", asyncHandler(sepayWebhookHandler));
router.post("/webhook/momo", asyncHandler(momoWebhookHandler));
router.get("/webhook/vnpay", asyncHandler(vnpayWebhookHandler));
router.post("/webhook/zalopay", asyncHandler(zaloPayCallbackHandler));
// ⚠️ Stripe cần raw body (Buffer) để verify chữ ký — KHÔNG được để express.json() parse trước route này.
//    Nếu app.ts có app.use(express.json()) áp dụng global TRƯỚC khi mount router này, phải loại trừ
//    path "/payment/webhook/stripe" khỏi middleware đó, nếu không req.body sẽ bị parse thành object
//    và constructEvent() của Stripe sẽ luôn báo signature invalid.
router.post("/webhook/stripe", express.raw({ type: "application/json" }), asyncHandler(stripeWebhookHandler));

// User payment flows
router.post("/momo/create", authMiddleware(), validate(createMomoPaymentSchema, "body"), asyncHandler(createMomoPaymentHandler));
router.get("/momo/return", asyncHandler(momoReturnHandler));

router.post("/vnpay/create", authMiddleware(), validate(createVnpayPaymentSchema, "body"), asyncHandler(createVnpayPaymentHandler));
router.get("/vnpay/return", asyncHandler(vnpayReturnHandler));

router.post("/zalopay/create", authMiddleware(), validate(createZaloPayPaymentSchema, "body"), asyncHandler(createZaloPayPaymentHandler));
router.get("/zalopay/return", asyncHandler(zaloPayReturnHandler));

router.post("/stripe/create", authMiddleware(), validate(createStripePaymentSchema, "body"), asyncHandler(createStripePaymentHandler));
router.get("/stripe/return", asyncHandler(stripeReturnHandler));

export default router;
