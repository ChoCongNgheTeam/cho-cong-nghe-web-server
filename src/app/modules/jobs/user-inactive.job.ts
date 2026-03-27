import prisma from "@/config/db";
import { sendInactiveUserNotification } from "@/app/modules/notification/notification.service";

export const runUserInactiveJob = async () => {
  console.log("[Job] Running user inactive check...");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // User chưa đăng nhập 30 ngày + chưa có voucher inactive trong 30 ngày
  const inactiveUsers = await prisma.users.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      role: "CUSTOMER",
      updatedAt: { lt: thirtyDaysAgo },
      // Chưa nhận USER_INACTIVE notification trong 30 ngày
      notifications: {
        none: {
          type: "USER_INACTIVE",
          createdAt: { gte: thirtyDaysAgo },
        },
      },
    },
    select: { id: true, email: true },
    take: 100, // batch size
  });

  let count = 0;
  for (const user of inactiveUsers) {
    try {
      // Tạo retention voucher
      const voucher = await prisma.vouchers.create({
        data: {
          code: `BACK_${user.id.slice(0, 8).toUpperCase()}`,
          description: "Voucher dành cho khách hàng lâu không ghé thăm",
          discountType: "DISCOUNT_FIXED",
          discountValue: "50000",
          minOrderValue: "200000",
          maxUses: 1,
          maxUsesPerUser: 1,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
          isActive: true,
          priority: 5,
          targets: { create: [{ targetType: "ALL" }] },
        },
      });

      // Assign cho user
      await prisma.voucher_user.create({
        data: { voucherId: voucher.id, userId: user.id, maxUses: 1, usedCount: 0 },
      });

      await sendInactiveUserNotification(user.id, voucher.code);
      count++;
    } catch (err) {
      console.error(`[Job] Failed for user ${user.id}:`, err);
    }
  }

  console.log(`[Job] Inactive users: sent ${count} retention vouchers`);
};
