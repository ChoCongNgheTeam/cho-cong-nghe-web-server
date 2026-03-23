import * as repo from "./notification.repository";
import { sendPushNotification } from "@/app/modules/integrations/firebase.service";
import { sendNotificationEmail } from "@/services/email.service";
import { CreateNotificationInput, NotificationPayload } from "./notification.types";
import prisma from "@/config/db";

/**
 * Core function — tạo notification trong DB + gửi push/email nếu cần
 */
export const createAndSend = async (payload: NotificationPayload, channels: Array<"IN_APP" | "PUSH" | "EMAIL">) => {
  const results = [];

  for (const channel of channels) {
    const notif = await repo.create({
      ...payload,
      channel,
      status: "PENDING",
    });

    try {
      if (channel === "IN_APP") {
        await repo.updateStatus(notif.id, "SENT", new Date());
      } else if (channel === "PUSH") {
        const tokens = await repo.getFcmTokensByUserId(payload.userId);
        let sent = false;

        for (const t of tokens) {
          const ok = await sendPushNotification(t.token, payload.title, payload.body, payload.data as any);
          if (!ok) {
            await repo.deleteFcmToken(t.token); // token hết hạn → xóa
          } else {
            sent = true;
          }
        }
        await repo.updateStatus(notif.id, sent ? "SENT" : "FAILED");
      } else if (channel === "EMAIL") {
        const user = await prisma.users.findUnique({
          where: { id: payload.userId },
          select: { email: true, fullName: true },
        });
        if (user) {
          await sendNotificationEmail(user.email, payload.title, payload.body, payload.data);
          await repo.updateStatus(notif.id, "SENT", new Date());
        }
      }

      results.push({ channel, status: "SENT" });
    } catch (err) {
      await repo.updateStatus(notif.id, "FAILED");
      results.push({ channel, status: "FAILED" });
    }
  }

  return results;
};

// ── Case 1: WELCOME_VOUCHER ───────────────────────────────────────────────────

export const sendWelcomeVoucherNotification = async (userId: string, voucherCode: string, discountValue: number) => {
  return createAndSend(
    {
      userId,
      type: "WELCOME_VOUCHER",
      title: "🎉 Chào mừng bạn đến với cửa hàng!",
      body: `Bạn nhận được voucher giảm ${discountValue.toLocaleString("vi-VN")}đ cho đơn hàng đầu tiên. Mã: ${voucherCode}`,
      data: { type: "WELCOME_VOUCHER", voucherCode, discountValue: String(discountValue) },
    },
    ["IN_APP", "EMAIL"],
  );
};

// ── Case 2: VOUCHER_EXPIRING ──────────────────────────────────────────────────

export const sendVoucherExpiringNotification = async (userId: string, voucherCode: string, hoursLeft: number) => {
  return createAndSend(
    {
      userId,
      type: "VOUCHER_EXPIRING",
      title: "⏰ Voucher của bạn sắp hết hạn!",
      body: `Voucher ${voucherCode} sẽ hết hạn trong ${hoursLeft}h. Đừng bỏ lỡ ưu đãi!`,
      data: { voucherCode, hoursLeft: String(hoursLeft) },
    },
    ["IN_APP", "PUSH"],
  );
};

// ── Case 3: CAMPAIGN_PROMOTION ────────────────────────────────────────────────

export const sendCampaignNotification = async (userIds: string[], title: string, body: string, data?: Record<string, any>) => {
  // Bulk create IN_APP cho tất cả users
  await repo.createMany(
    userIds.map((userId) => ({
      userId,
      type: "CAMPAIGN_PROMOTION" as const,
      title,
      body,
      data,
      channel: "IN_APP" as const,
      status: "SENT" as const,
    })),
  );

  // Push notification gửi batch
  const allTokens = await Promise.all(userIds.map((id) => repo.getFcmTokensByUserId(id)));
  const flatTokens = allTokens.flat().map((t) => t.token);

  if (flatTokens.length > 0) {
    const { sendMulticastNotification } = await import("@/app/modules/integrations/firebase.service");
    await sendMulticastNotification(flatTokens, title, body, data as any);
  }
};

// ── Case 4: USER_INACTIVE ─────────────────────────────────────────────────────

export const sendInactiveUserNotification = async (userId: string, voucherCode: string) => {
  return createAndSend(
    {
      userId,
      type: "USER_INACTIVE",
      title: "👀 Lâu rồi chưa ghé thăm!",
      body: `Tặng bạn voucher ${voucherCode} để quay lại mua sắm 🎁`,
      data: { voucherCode },
    },
    ["IN_APP", "EMAIL", "PUSH"],
  );
};

// ── User reads ────────────────────────────────────────────────────────────────

export const getMyNotifications = async (userId: string, page: number, limit: number) => {
  return repo.findByUserId(userId, page, limit);
};

export const markAsRead = async (id: string, userId: string) => {
  return repo.markAsRead(id, userId);
};

export const markAllAsRead = async (userId: string) => {
  return repo.markAllAsRead(userId);
};

export const saveFcmToken = async (userId: string, token: string, device?: string) => {
  return repo.saveFcmToken(userId, token, device);
};

export const deleteFcmToken = async (token: string) => {
  return repo.deleteFcmToken(token);
};
