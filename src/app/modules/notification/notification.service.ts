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
    // EMAIL không cần lưu DB — chỉ gửi mail
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
      continue;
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

// ── Admin reads ───────────────────────────────────────────────────────────────

/** Lấy thông báo dành cho admin/staff (chỉ ORDER_STATUS, COMMENT_NEW, REVIEW_NEW) */
export const getAdminNotifications = async (userId: string, page: number, limit: number) => {
  return repo.findAdminNotifications(userId, page, limit);
};

/** Đánh dấu tất cả thông báo admin/staff đã đọc */
export const markAllAdminAsRead = async (userId: string) => {
  return repo.markAllAdminAsRead(userId);
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

// ── Case 6: ORDER_CREATED_ADMIN ───────────────────────────────────────────────

export const sendOrderCreatedAdminNotification = async (orderCode: string) => {
  try {
    const adminsAndStaffs = await prisma.users.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (adminsAndStaffs.length === 0) return;

    const notificationPromises = adminsAndStaffs.map((user) =>
      createAndSend(
        {
          userId: user.id,
          type: "ORDER_STATUS",
          title: "🛒 Có đơn hàng mới!",
          body: `Đơn hàng #${orderCode} vừa được khách hàng đặt và đang chờ xử lý.`,
          data: { orderCode, status: "PENDING" },
        },
        ["IN_APP"],
      ),
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("[Notification Error] Lỗi khi gửi thông báo Admin:", error);
  }
};

// ── Case 7: COMMENT_NEW ───────────────────────────────────────────────────────

/**
 * Gửi thông báo cho tất cả ADMIN + STAFF khi có bình luận mới từ khách hàng.
 * Gọi hàm này từ comment module sau khi tạo comment thành công.
 *
 * @param customerName  Tên khách hàng bình luận
 * @param productName   Tên sản phẩm được bình luận
 * @param commentId     ID comment để admin có thể navigate
 * @param productId     ID sản phẩm liên quan
 */
export const sendCommentNewAdminNotification = async (customerName: string, productName: string, commentId: string, productId: string) => {
  try {
    const adminsAndStaffs = await prisma.users.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (adminsAndStaffs.length === 0) return;

    const notificationPromises = adminsAndStaffs.map((user) =>
      createAndSend(
        {
          userId: user.id,
          type: "COMMENT_NEW",
          title: "💬 Bình luận mới!",
          body: `${customerName} vừa bình luận về sản phẩm "${productName}".`,
          data: { commentId, productId, productName, customerName },
        },
        ["IN_APP"],
      ),
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("[Notification Error] Lỗi khi gửi thông báo comment mới:", error);
  }
};

// ── Case 8: REVIEW_NEW ────────────────────────────────────────────────────────

/**
 * Gửi thông báo cho tất cả ADMIN + STAFF khi có đánh giá mới từ khách hàng.
 * Gọi hàm này từ review module sau khi tạo review thành công.
 *
 * @param customerName  Tên khách hàng đánh giá
 * @param productName   Tên sản phẩm được đánh giá
 * @param rating        Số sao (1-5)
 * @param reviewId      ID review để admin có thể navigate
 * @param productId     ID sản phẩm liên quan
 */
export const sendReviewNewAdminNotification = async (customerName: string, productName: string, rating: number, reviewId: string, productId: string) => {
  try {
    const adminsAndStaffs = await prisma.users.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (adminsAndStaffs.length === 0) return;

    const stars = "⭐".repeat(Math.min(rating, 5));
    const notificationPromises = adminsAndStaffs.map((user) =>
      createAndSend(
        {
          userId: user.id,
          type: "REVIEW_NEW",
          title: `${stars} Đánh giá mới!`,
          body: `${customerName} vừa đánh giá ${rating}/5 sao cho sản phẩm "${productName}".`,
          data: { reviewId, productId, productName, customerName, rating: String(rating) },
        },
        ["IN_APP"],
      ),
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("[Notification Error] Lỗi khi gửi thông báo review mới:", error);
  }
};
