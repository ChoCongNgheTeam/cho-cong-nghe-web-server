import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { requirePermission } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./order.controller";
import { updateOrderAdminSchema, createOrderAdminSchema, orderQuerySchema, exportOrderSchema, confirmRefundSchema } from "./order.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

// ================== PUBLIC (USER) ==================
router.get("/my", authMiddleware(true), asyncHandler(c.getMyOrdersHandler));
router.get("/my/:id", authMiddleware(true), asyncHandler(c.getOrderDetailHandler));
router.get("/by-code/:orderCode/payment-info", authMiddleware(true), asyncHandler(c.getOrderPaymentInfoHandler));
router.post("/my/:id/cancel", authMiddleware(true), asyncHandler(c.cancelOrderUserHandler));
router.post("/my/:id/reorder", authMiddleware(true), asyncHandler(c.reorderUserHandler));

// ================== STAFF & ADMIN ==================
// authMiddleware áp dụng cho tất cả /admin routes
router.use("/admin", authMiddleware(true));

// Xem danh sách & chi tiết đơn — cần canViewOrders
router.get("/admin/all", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canViewOrders"), validate(orderQuerySchema, "query"), asyncHandler(c.getAllOrdersAdminHandler));

router.get("/admin/export", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canViewOrders"), validate(exportOrderSchema, "query"), asyncHandler(c.exportOrdersAdminHandler));

router.get("/admin/:id", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canViewOrders"), asyncHandler(c.getOrderAdminDetailHandler));

// Cập nhật trạng thái đơn — cần canUpdateOrder
router.patch("/admin/:id", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canUpdateOrder"), validate(updateOrderAdminSchema, "body"), asyncHandler(c.updateOrderAdminHandler));

router.post("/admin/:id/confirm-refund", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canUpdateOrder"), validate(confirmRefundSchema, "body"), asyncHandler(c.confirmManualRefundHandler));

router.post("/admin/:id/cancel", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canUpdateOrder"), asyncHandler(c.cancelOrderAdminHandler));

// ================== ADMIN ONLY ==================
router.post("/admin", requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canCreateOrder"), validate(createOrderAdminSchema, "body"), asyncHandler(c.createOrderAdminHandler));
export default router;
