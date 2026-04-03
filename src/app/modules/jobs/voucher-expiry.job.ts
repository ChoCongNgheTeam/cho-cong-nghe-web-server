import prisma from "@/config/db";
import { sendVoucherExpiringNotification } from "@/app/modules/notification/notification.service";

export const runVoucherExpiryJob = async () => {
  // console.log("[Job] Running voucher expiry check...");

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Lấy voucher_user có voucher sắp hết hạn trong 24-48h
  const expiringVoucherUsers = await prisma.voucher_user.findMany({
    where: {
      usedCount: { lt: prisma.voucher_user.fields.maxUses }, // chưa dùng hết
      voucher: {
        isActive: true,
        deletedAt: null,
        endDate: { gte: in24h, lte: in48h },
      },
    },
    include: {
      voucher: { select: { code: true, endDate: true } },
    },
  });

  let count = 0;
  for (const vu of expiringVoucherUsers) {
    const hoursLeft = Math.round((vu.voucher.endDate!.getTime() - now.getTime()) / (60 * 60 * 1000));
    try {
      await sendVoucherExpiringNotification(vu.userId, vu.voucher.code, hoursLeft);
      count++;
    } catch (err) {
      console.error(`[Job] Failed to notify user ${vu.userId}:`, err);
    }
  }

  // console.log(`[Job] Voucher expiry: notified ${count} users`);
};
