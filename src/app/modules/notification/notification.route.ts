import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validate } from "@/app/middlewares/validate.middleware";
import { z } from "zod";
import { getMyNotificationsHandler, markAsReadHandler, markAllAsReadHandler, saveFcmTokenHandler, deleteFcmTokenHandler, sendCampaignHandler } from "./notification.controller";

const router = Router();
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// FCM token schemas
const saveFcmTokenSchema = z.object({
  token: z.string().min(1, "FCM token không được để trống"),
  device: z.enum(["web", "ios", "android"]).optional(),
});

const deleteFcmTokenSchema = z.object({
  token: z.string().min(1),
});

// Campaign schema
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

// Đánh dấu 1 notification đã đọc
router.patch("/:id/read", authMiddleware(), asyncHandler(markAsReadHandler));

// Đánh dấu tất cả đã đọc
router.patch("/read-all", authMiddleware(), asyncHandler(markAllAsReadHandler));

// Lưu FCM token (gọi khi user allow notification trên browser/app)
router.post("/fcm-token", authMiddleware(), validate(saveFcmTokenSchema, "body"), asyncHandler(saveFcmTokenHandler));

// Xóa FCM token (gọi khi logout)
router.delete("/fcm-token", authMiddleware(), validate(deleteFcmTokenSchema, "body"), asyncHandler(deleteFcmTokenHandler));

// ── Admin routes ──────────────────────────────────────────────────────────────

// Gửi campaign notification
router.post("/admin/campaign", ...adminAuth, validate(sendCampaignSchema, "body"), asyncHandler(sendCampaignHandler));

export default router;
