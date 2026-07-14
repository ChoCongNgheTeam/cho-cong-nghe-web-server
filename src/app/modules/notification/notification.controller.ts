import { Request, Response } from "express";
import * as notificationService from "./notification.service";
import { UnauthorizedError } from "@/errors";
import { SaveFcmTokenInput, DeleteFcmTokenInput, SendCampaignInput } from "./notification.validation";

// User

export const getMyNotificationsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const result = await notificationService.getMyNotifications(userId, page, limit);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      unreadCount: result.unreadCount,
    },
    message: "Lấy thông báo thành công",
  });
};

export const markAsReadHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  await notificationService.markAsRead(req.params.id, userId);
  res.json({ message: "Đã đánh dấu đã đọc" });
};

export const markAllAsReadHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  await notificationService.markAllAsRead(userId);
  res.json({ message: "Đã đánh dấu tất cả đã đọc" });
};

export const saveFcmTokenHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const { token, device } = req.body as unknown as SaveFcmTokenInput;
  await notificationService.saveFcmToken(userId, token, device);
  res.json({ message: "Lưu FCM token thành công" });
};

export const deleteFcmTokenHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const { token } = req.body as unknown as DeleteFcmTokenInput;
  await notificationService.deleteFcmToken(token, userId);
  res.json({ message: "Xóa FCM token thành công" });
};

// Admin

export const sendCampaignHandler = async (req: Request, res: Response) => {
  const { title, body, data, targetAll, userIds } = req.body as unknown as SendCampaignInput;

  const targetIds = await notificationService.resolveCampaignTargetIds(!!targetAll, userIds ?? []);

  if (targetIds.length === 0) {
    return res.status(400).json({ message: "Không có user nào để gửi" });
  }

  await notificationService.sendCampaignNotification(targetIds, title, body, data);

  res.json({
    message: `Đã gửi thông báo campaign đến ${targetIds.length} người dùng`,
    data: { sentTo: targetIds.length },
  });
};

/**
 * GET /notifications/admin
 * Lấy thông báo dành cho admin/staff: chỉ gồm ORDER_STATUS, COMMENT_NEW, REVIEW_NEW.
 * Mỗi admin/staff chỉ thấy thông báo được gửi đến chính họ (theo userId).
 */
export const getAdminNotificationsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const result = await notificationService.getAdminNotifications(userId, page, limit);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      unreadCount: result.unreadCount,
    },
    message: "Lấy thông báo admin thành công",
  });
};

/**
 * PATCH /notifications/admin/read-all
 * Đánh dấu tất cả thông báo admin/staff (ORDER_STATUS, COMMENT_NEW, REVIEW_NEW) đã đọc.
 */
export const markAllAdminAsReadHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  await notificationService.markAllAdminAsRead(userId);
  res.json({ message: "Đã đánh dấu tất cả thông báo admin đã đọc" });
};
