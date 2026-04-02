import prisma from "@/config/db";
import { CreateNotificationInput, ADMIN_NOTIFICATION_TYPES } from "./notification.types";

export const create = async (input: CreateNotificationInput) => {
  return prisma.notifications.create({ data: input });
};

export const createMany = async (inputs: CreateNotificationInput[]) => {
  return prisma.notifications.createMany({ data: inputs });
};

export const findByUserId = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total, unreadCount] = await prisma.$transaction([
    prisma.notifications.findMany({
      where: { userId, channel: "IN_APP" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notifications.count({ where: { userId, channel: "IN_APP" } }),
    prisma.notifications.count({ where: { userId, channel: "IN_APP", isRead: false } }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit), unreadCount };
};

/**
 * Lấy thông báo dành cho admin/staff:
 * Chỉ trả về các type liên quan đến đơn hàng mới, comment, review.
 * Lọc theo userId của chính admin/staff đó (vì thông báo được tạo trên userId của họ).
 */
export const findAdminNotifications = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const where = {
    userId,
    type: { in: ADMIN_NOTIFICATION_TYPES },
    channel: "IN_APP" as const,
  };

  const [data, total, unreadCount] = await prisma.$transaction([
    prisma.notifications.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notifications.count({ where }),
    prisma.notifications.count({ where: { ...where, isRead: false } }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit), unreadCount };
};

export const markAsRead = async (id: string, userId: string) => {
  return prisma.notifications.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notifications.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

/**
 * Đánh dấu tất cả thông báo admin/staff đã đọc
 * (chỉ các type liên quan đến đơn hàng, comment, review)
 */
export const markAllAdminAsRead = async (userId: string) => {
  return prisma.notifications.updateMany({
    where: {
      userId,
      isRead: false,
      type: { in: ADMIN_NOTIFICATION_TYPES },
      channel: "IN_APP",
    },
    data: { isRead: true, readAt: new Date() },
  });
};

export const updateStatus = async (id: string, status: "SENT" | "FAILED", sentAt?: Date) => {
  return prisma.notifications.update({
    where: { id },
    data: { status, sentAt: sentAt ?? new Date() },
  });
};

export const saveFcmToken = async (userId: string, token: string, device?: string) => {
  return prisma.fcm_tokens.upsert({
    where: { token },
    update: { userId, device, updatedAt: new Date() },
    create: { userId, token, device },
  });
};

export const getFcmTokensByUserId = async (userId: string) => {
  return prisma.fcm_tokens.findMany({ where: { userId } });
};

export const deleteFcmToken = async (token: string) => {
  return prisma.fcm_tokens.deleteMany({ where: { token } });
};
