import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { getAllPaymentMethodsHandler, getActivePaymentMethodsHandler, createPaymentMethodHandler, updatePaymentMethodHandler, deletePaymentMethodHandler, webhookHandler } from "./payment.controller";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./payment.validation";

const router = Router();

// Public - FE dùng để render select
router.get("/active", getActivePaymentMethodsHandler);

// Admin CRUD
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), getAllPaymentMethodsHandler);

router.post("/admin", authMiddleware(), requireRole("ADMIN"), validate(createPaymentMethodSchema), createPaymentMethodHandler);

router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(updatePaymentMethodSchema), updatePaymentMethodHandler);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), deletePaymentMethodHandler);

// Webhook - public (ngân hàng gọi vào)
router.post("/webhook", webhookHandler);

export default router;
