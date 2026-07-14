import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validate } from "@/app/middlewares/validate.middleware";
import * as controller from "./notification.controller";
import * as validator from "./notification.validation";

const router = Router();

// Middleware groups
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;
const staffAuth = [authMiddleware(), requireRole("ADMIN", "STAFF")] as const;

// User routes

// Lấy danh sách notification của user
router.get("/", authMiddleware(), asyncHandler(controller.getMyNotificationsHandler));

// Đánh dấu 1 notification đã đọc (dùng chung cho cả user và admin/staff)
router.patch("/:id/read", authMiddleware(), asyncHandler(controller.markAsReadHandler));

// Đánh dấu tất cả đã đọc (dành cho user thường)
router.patch("/read-all", authMiddleware(), asyncHandler(controller.markAllAsReadHandler));

// Lưu FCM token (gọi khi user allow notification trên browser/app)
router.post("/fcm-token", authMiddleware(), validate(validator.saveFcmTokenSchema, "body"), asyncHandler(controller.saveFcmTokenHandler));

// Xóa FCM token (gọi khi logout)
router.delete("/fcm-token", authMiddleware(), validate(validator.deleteFcmTokenSchema, "body"), asyncHandler(controller.deleteFcmTokenHandler));

// Admin / Staff notification routes

/**
 * GET /notifications/admin
 * Lấy thông báo dành cho admin/staff.
 * Chỉ trả về các type: ORDER_STATUS (đơn hàng mới), COMMENT_NEW, REVIEW_NEW.
 * Mỗi người chỉ thấy thông báo được gửi đến chính họ.
 *
 * Query params: page, limit
 * Response: { data, meta: { page, limit, total, totalPages, unreadCount } }
 */
router.get("/admin", ...staffAuth, asyncHandler(controller.getAdminNotificationsHandler));

/**
 * PATCH /notifications/admin/read-all
 * Đánh dấu tất cả thông báo admin/staff đã đọc.
 * Chỉ tác động các type: ORDER_STATUS, COMMENT_NEW, REVIEW_NEW.
 */
router.patch("/admin/read-all", ...staffAuth, asyncHandler(controller.markAllAdminAsReadHandler));

/**
 * PATCH /notifications/:id/read
 * Đánh dấu 1 thông báo đã đọc — dùng chung ở trên, hoạt động cho cả admin/staff.
 */

// Admin-only routes

/**
 * POST /notifications/admin/campaign
 * Gửi campaign notification đến nhiều user (chỉ ADMIN).
 */
router.post("/admin/campaign", ...adminAuth, validate(validator.sendCampaignSchema, "body"), asyncHandler(controller.sendCampaignHandler));

export default router;
