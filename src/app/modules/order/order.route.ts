import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./order.controller";
import { updateOrderAdminSchema, createOrderAdminSchema, orderQuerySchema } from "./order.validation";

const router = Router();

// ================== PUBLIC (USER) ==================
router.get("/my", authMiddleware(true), asyncHandler(c.getMyOrdersHandler));
router.get("/my/:id", authMiddleware(true), asyncHandler(c.getOrderDetailHandler));
router.get("/by-code/:orderCode/payment-info", authMiddleware(true), asyncHandler(c.getOrderPaymentInfoHandler));
router.post("/my/:id/cancel", authMiddleware(true), asyncHandler(c.cancelOrderUserHandler));
router.post("/my/:id/reorder", authMiddleware(true), asyncHandler(c.reorderUserHandler));

// ================== STAFF & ADMIN ==================
router.use("/admin", authMiddleware(true));

// 1. Quyền chung STAFF & ADMIN
router.get("/admin/all", requireRole("STAFF", "ADMIN"), validate(orderQuerySchema, "query"), asyncHandler(c.getAllOrdersAdminHandler));
router.get("/admin/:id", requireRole("STAFF", "ADMIN"), asyncHandler(c.getOrderAdminDetailHandler));
router.patch("/admin/:id", requireRole("STAFF", "ADMIN"), validate(updateOrderAdminSchema, "body"), asyncHandler(c.updateOrderAdminHandler));
router.post("/admin/:id/cancel", requireRole("STAFF", "ADMIN"), asyncHandler(c.cancelOrderAdminHandler));

// ================== ADMIN ONLY ==================
router.post("/admin", requireRole("ADMIN"), validate(createOrderAdminSchema, "body"), asyncHandler(c.createOrderAdminHandler));

// Archive (Lưu trữ rác)
router.get("/admin/archive/orders", requireRole("ADMIN"), validate(orderQuerySchema, "query"), asyncHandler(c.getArchivedOrdersAdminHandler));
router.post("/admin/:id/archive", requireRole("ADMIN"), asyncHandler(c.archiveOrderAdminHandler));
router.post("/admin/:id/unarchive", requireRole("ADMIN"), asyncHandler(c.unarchiveOrderAdminHandler));
router.delete("/admin/:id/permanent", requireRole("ADMIN"), asyncHandler(c.hardDeleteOrderAdminHandler));

export default router;
