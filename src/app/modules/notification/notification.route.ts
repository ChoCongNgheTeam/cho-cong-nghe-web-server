import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validate } from "@/app/middlewares/validate.middleware";
import { z } from "zod";
import {
  getMyNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  saveFcmTokenHandler,
  deleteFcmTokenHandler,
  sendCampaignHandler,
  getAdminNotificationsHandler,
  markAllAdminAsReadHandler,
} from "./notification.controller";

const router = Router();

// Middleware groups
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;
const staffAuth = [authMiddleware(), requireRole("ADMIN", "STAFF")] as const;

// ── Schemas ───────────────────────────────────────────────────────────────────

const saveFcmTokenSchema = z.object({
  token: z.string().min(1, "FCM token không được để trống"),
  device: z.enum(["web", "ios", "android"]).optional(),
});

const deleteFcmTokenSchema = z.object({
  token: z.string().min(1),
});

const sendCampaignSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  body: z.string().min(1, "Nội dung không được để trống"),
  data: z.record(z.string(), z.any()).optional(),
  targetAll: z.boolean().optional().default(false),
  userIds: z.array(z.string().uuid()).optional(),
});

// ── User routes ───────────────────────────────────────────────────────────────

// Lấy danh sách notification của user
router.get("/", authMiddleware(), asyncHandler(getMyNotificationsHandler));

// Đánh dấu 1 notification đã đọc (dùng chung cho cả user và admin/staff)
router.patch("/:id/read", authMiddleware(), asyncHandler(markAsReadHandler));

// Đánh dấu tất cả đã đọc (dành cho user thường)
router.patch("/read-all", authMiddleware(), asyncHandler(markAllAsReadHandler));

// Lưu FCM token (gọi khi user allow notification trên browser/app)
router.post("/fcm-token", authMiddleware(), validate(saveFcmTokenSchema, "body"), asyncHandler(saveFcmTokenHandler));

// Xóa FCM token (gọi khi logout)
router.delete("/fcm-token", authMiddleware(), validate(deleteFcmTokenSchema, "body"), asyncHandler(deleteFcmTokenHandler));

// ── Admin / Staff notification routes ─────────────────────────────────────────

/**
 * GET /notifications/admin
 * Lấy thông báo dành cho admin/staff.
 * Chỉ trả về các type: ORDER_STATUS (đơn hàng mới), COMMENT_NEW, REVIEW_NEW.
 * Mỗi người chỉ thấy thông báo được gửi đến chính họ.
 *
 * Query params: page, limit
 * Response: { data, meta: { page, limit, total, totalPages, unreadCount } }
 */
router.get("/admin", ...staffAuth, asyncHandler(getAdminNotificationsHandler));

/**
 * PATCH /notifications/admin/read-all
 * Đánh dấu tất cả thông báo admin/staff đã đọc.
 * Chỉ tác động các type: ORDER_STATUS, COMMENT_NEW, REVIEW_NEW.
 */
router.patch("/admin/read-all", ...staffAuth, asyncHandler(markAllAdminAsReadHandler));

/**
 * PATCH /notifications/:id/read
 * Đánh dấu 1 thông báo đã đọc — dùng chung ở trên, hoạt động cho cả admin/staff.
 */

// ── Admin-only routes ─────────────────────────────────────────────────────────

/**
 * POST /notifications/admin/campaign
 * Gửi campaign notification đến nhiều user (chỉ ADMIN).
 */
router.post("/admin/campaign", ...adminAuth, validate(sendCampaignSchema, "body"), asyncHandler(sendCampaignHandler));

export default router;
