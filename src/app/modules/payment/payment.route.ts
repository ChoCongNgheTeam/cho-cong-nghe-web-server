import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  getAllPaymentMethodsHandler,
  getActivePaymentMethodsHandler,
  createPaymentMethodHandler,
  updatePaymentMethodHandler,
  deletePaymentMethodHandler,
  sepayWebhookHandler,
  createMomoPaymentHandler,
  momoWebhookHandler,
  createVnpayPaymentHandler,
  vnpayWebhookHandler,
  vnpayReturnHandler,
  momoReturnHandler,
  createZaloPayPaymentHandler,
  zaloPayCallbackHandler,
  zaloPayReturnHandler,
} from "./payment.controller";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./payment.validation";

import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// Public - FE dùng để render select
router.get("/active", getActivePaymentMethodsHandler);

// Admin CRUD
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), getAllPaymentMethodsHandler);

router.post("/admin", authMiddleware(), requireRole("ADMIN"), validate(createPaymentMethodSchema), createPaymentMethodHandler);

router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(updatePaymentMethodSchema), updatePaymentMethodHandler);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), deletePaymentMethodHandler);

// SePay
router.post("/webhook/sepay", sepayWebhookHandler);

// MoMo
router.post("/momo/create", authMiddleware(), createMomoPaymentHandler);
router.post("/webhook/momo", momoWebhookHandler); // MoMo IPN - public
router.get("/momo/return", asyncHandler(momoReturnHandler));

// VNPay
router.post("/vnpay/create", authMiddleware(), createVnpayPaymentHandler);
router.get("/webhook/vnpay", vnpayWebhookHandler); // VNPay IPN - GET - public
router.get("/vnpay/return", asyncHandler(vnpayReturnHandler));

// ZaloPay
router.post("/zalopay/create", authMiddleware(), createZaloPayPaymentHandler);
router.post("/webhook/zalopay", zaloPayCallbackHandler); // ZaloPay dùng POST callback
router.get("/zalopay/return", asyncHandler(zaloPayReturnHandler));

export default router;
