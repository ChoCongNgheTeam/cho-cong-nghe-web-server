import prisma from "@/config/db";
import { CreateNotificationInput } from "./notification.types";

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
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notifications.count({ where: { userId } }),
    prisma.notifications.count({ where: { userId, isRead: false } }),
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
