import { Request, Response } from "express";
import * as notificationService from "./notification.service";
import { UnauthorizedError } from "@/errors";

// ── User ──────────────────────────────────────────────────────────────────────

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

  const { token, device } = req.body;
  await notificationService.saveFcmToken(userId, token, device);
  res.json({ message: "Lưu FCM token thành công" });
};

export const deleteFcmTokenHandler = async (req: Request, res: Response) => {
  const { token } = req.body;
  await notificationService.deleteFcmToken(token);
  res.json({ message: "Xóa FCM token thành công" });
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const sendCampaignHandler = async (req: Request, res: Response) => {
  const { title, body, data, targetAll } = req.body;

  let userIds: string[] = req.body.userIds ?? [];

  // Nếu targetAll=true → lấy tất cả active users
  if (targetAll) {
    const { default: prisma } = await import("@/config/db");
    const users = await prisma.users.findMany({
      where: { isActive: true, deletedAt: null, role: "CUSTOMER" },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  if (userIds.length === 0) {
    return res.status(400).json({ message: "Không có user nào để gửi" });
  }

  await notificationService.sendCampaignNotification(userIds, title, body, data);

  res.json({
    message: `Đã gửi thông báo campaign đến ${userIds.length} người dùng`,
    data: { sentTo: userIds.length },
  });
};
