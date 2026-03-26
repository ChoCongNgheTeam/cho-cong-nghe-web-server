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
    // ← EMAIL không cần lưu DB — chỉ gửi mail
    if (channel === "EMAIL") {
      try {
        const user = await prisma.users.findUnique({
          where: { id: payload.userId },
          select: { email: true, fullName: true },
        });
        if (user) {
          await sendNotificationEmail(user.email, payload.title, payload.body, { ...payload.data, type: payload.type });
        }
        results.push({ channel, status: "SENT" });
      } catch {
        results.push({ channel, status: "FAILED" });
      }
      continue; // ← skip tạo DB row
    }

    // IN_APP + PUSH → lưu DB
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
          if (!ok) await repo.deleteFcmToken(t.token);
          else sent = true;
        }
        await repo.updateStatus(notif.id, sent ? "SENT" : "FAILED");
      }

      results.push({ channel, status: "SENT" });
    } catch {
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

// ── Case 5: ORDER_STATUS ──────────────────────────────────────────────────────

const orderStatusMap: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Giao thành công",
  CANCELLED: "Đã hủy",
};

export const sendOrderStatusNotification = async (userId: string, orderCode: string, status: string) => {
  const statusText = orderStatusMap[status] || status;
  
  let title = `Cập nhật đơn hàng #${orderCode}`;
  let body = `Đơn hàng của bạn đã chuyển sang trạng thái: ${statusText}.`;

  // Tùy chỉnh thông điệp cho sinh động dựa trên trạng thái
  if (status === "SHIPPED") {
    title = `🚚 Đơn hàng #${orderCode} đang được giao!`;
    body = `Đơn hàng của bạn đã được giao cho đơn vị vận chuyển. Vui lòng chú ý điện thoại nhé.`;
  } else if (status === "DELIVERED") {
    title = `✅ Giao hàng thành công!`;
    body = `Đơn hàng #${orderCode} đã được giao thành công. Cảm ơn bạn đã tin tưởng mua sắm!`;
  } else if (status === "CANCELLED") {
    title = `❌ Đơn hàng #${orderCode} đã bị hủy`;
    body = `Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ CSKH.`;
  }

  // Gọi hàm core createAndSend để tự động gửi In-app, Email và Push (nếu có token)
  return createAndSend(
    {
      userId,
      type: "ORDER_STATUS",
      title,
      body,
      data: { orderCode, status },
    },
    ["IN_APP", "EMAIL", "PUSH"], 
  );
};

// ── Case 6: ORDER_CREATED_ADMIN ──────────────────────────────────────────────────────

export const sendOrderCreatedAdminNotification = async (orderCode: string) => {
  try {
    // 1. Lấy danh sách ID của tất cả ADMIN và STAFF (đang hoạt động)
    const adminsAndStaffs = await prisma.users.findMany({
      where: { 
        role: { in: ["ADMIN", "STAFF"] },
        isActive: true,
        deletedAt: null
      },
      select: { id: true },
    });

    if (adminsAndStaffs.length === 0) return;

    // 2. Gửi thông báo cho từng người
    const notificationPromises = adminsAndStaffs.map((user) => 
      createAndSend(
        {
          userId: user.id,
          type: "ORDER_STATUS", // Có thể dùng lại type này hoặc định nghĩa thêm type mới trong notification.types.ts
          title: "🛒 Có đơn hàng mới!",
          body: `Đơn hàng #${orderCode} vừa được khách hàng đặt và đang chờ xử lý.`,
          data: { orderCode, status: "PENDING" },
        },
        ["IN_APP", "PUSH"] // Gửi vào chuông thông báo web admin và Push về điện thoại admin
      )
    );

    // Chạy song song tất cả các luồng gửi
    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("[Notification Error] Lỗi khi gửi thông báo Admin:", error);
  }
};