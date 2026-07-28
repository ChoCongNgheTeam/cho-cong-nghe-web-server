import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { spinPrizeSelectAdmin } from "./spin.types";
import { CreatePrizeInput, UpdatePrizeInput } from "./spin.validation";

// ============================================================================
// ADMIN — CRUD phần thưởng
// ============================================================================

export const findAllPrizesAdmin = async () => {
  return prisma.spin_prizes.findMany({ select: spinPrizeSelectAdmin, orderBy: { order: "asc" } });
};

export const findPrizeById = async (id: string) => {
  return prisma.spin_prizes.findUnique({ where: { id }, select: spinPrizeSelectAdmin });
};

// Đếm số phần thưởng đang active có totalBudget = null (lưới an toàn — luôn phải còn >= 1)
export const countActiveUnlimitedPrizes = async (excludeId?: string) => {
  return prisma.spin_prizes.count({
    where: { isActive: true, totalBudget: null, ...(excludeId && { id: { not: excludeId } }) },
  });
};

export const create = async (data: CreatePrizeInput) => {
  return prisma.spin_prizes.create({
    data: {
      label: data.label,
      colorHex: data.colorHex ?? null,
      voucherId: data.voucherId ?? null,
      weight: data.weight,
      totalBudget: data.totalBudget ?? null,
      order: data.order,
      isActive: data.isActive ?? true,
    },
    select: spinPrizeSelectAdmin,
  });
};

export const update = async (id: string, data: UpdatePrizeInput) => {
  const updateData: Prisma.spin_prizesUpdateInput = {};
  if (data.label !== undefined) updateData.label = data.label;
  if (data.colorHex !== undefined) updateData.colorHex = data.colorHex;
  if (data.voucherId !== undefined) updateData.voucher = data.voucherId ? { connect: { id: data.voucherId } } : { disconnect: true };
  if (data.weight !== undefined) updateData.weight = data.weight;
  if (data.totalBudget !== undefined) updateData.totalBudget = data.totalBudget;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.spin_prizes.update({ where: { id }, data: updateData, select: spinPrizeSelectAdmin });
};

export const remove = async (id: string) => {
  return prisma.spin_prizes.delete({ where: { id } });
};

export const countEntriesForPrize = async (prizeId: string) => {
  return prisma.spin_entries.count({ where: { prizeId } });
};

// ============================================================================
// PUBLIC — trạng thái + quay
// ============================================================================

export const findEntryByUserId = async (userId: string) => {
  return prisma.spin_entries.findUnique({
    where: { userId },
    include: { prize: { select: { id: true, label: true, voucherId: true, voucher: { select: { code: true } } } } },
  });
};

/**
 * Toàn bộ phần thưởng đang active — lọc "còn ngân sách hay không" được thực hiện
 * ở tầng service bằng JS (so sánh awardedCount < totalBudget), vì Prisma không hỗ
 * trợ so sánh 2 cột với nhau ngay trong `where`. Danh sách này luôn nhỏ (config admin),
 * nên lọc ở application code không ảnh hưởng hiệu năng.
 */
export const findActivePrizesRaw = async (tx?: Prisma.TransactionClient) => {
  const client = tx ?? prisma;
  return client.spin_prizes.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
};

// Danh sách public để FE vẽ vòng quay (không lộ voucherId/weight/totalBudget)
export const findAllActivePrizesPublic = async () => {
  return prisma.spin_prizes.findMany({
    where: { isActive: true },
    select: { id: true, label: true, colorHex: true, order: true },
    orderBy: { order: "asc" },
  });
};

export const createEntryTx = async (tx: Prisma.TransactionClient, userId: string, prizeId: string) => {
  return tx.spin_entries.create({ data: { userId, prizeId } });
};

/**
 * Tăng awardedCount một cách an toàn với race condition: nếu prize có totalBudget,
 * chỉ tăng khi awardedCount vẫn còn dưới ngân sách tại thời điểm ghi (atomic check-and-increment
 * qua updateMany). Trả về false nếu vừa hết ngân sách do 2 request quay cùng lúc — caller cần
 * rollback (throw) để toàn bộ transaction huỷ, không để lọt 1 lượt trúng vượt ngân sách.
 */
export const incrementAwardedCountTx = async (tx: Prisma.TransactionClient, prizeId: string, totalBudget: number | null): Promise<boolean> => {
  if (totalBudget === null) {
    await tx.spin_prizes.update({ where: { id: prizeId }, data: { awardedCount: { increment: 1 } } });
    return true;
  }

  const result = await tx.spin_prizes.updateMany({
    where: { id: prizeId, awardedCount: { lt: totalBudget } },
    data: { awardedCount: { increment: 1 } },
  });
  return result.count > 0;
};

export const createVoucherUserTx = async (tx: Prisma.TransactionClient, voucherId: string, userId: string) => {
  return tx.voucher_user.create({ data: { voucherId, userId, maxUses: 1 } });
};

export const findVoucherCode = async (voucherId: string) => {
  const voucher = await prisma.vouchers.findUnique({ where: { id: voucherId }, select: { code: true } });
  return voucher?.code ?? null;
};

// Dùng khi admin gán voucher cho 1 phần thưởng — chặn sớm voucher đã hết hạn/tắt active
// để tránh trường hợp user quay trúng nhưng ra checkout lại không áp được mã.
export const findVoucherForValidation = async (voucherId: string) => {
  return prisma.vouchers.findUnique({
    where: { id: voucherId, deletedAt: null },
    select: { id: true, code: true, isActive: true, endDate: true },
  });
};

// ============================================================================
// THỐNG KÊ ADMIN
// ============================================================================

export const getSpinStats = async () => {
  const [totalSpins, byPrize] = await Promise.all([
    prisma.spin_entries.count(),
    prisma.spin_prizes.findMany({
      select: {
        id: true,
        label: true,
        colorHex: true,
        totalBudget: true,
        awardedCount: true,
        voucherId: true,
        _count: { select: { entries: true } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return { totalSpins, byPrize };
};

// ============================================================================
// RESET DỮ LIỆU (dùng trước buổi thi/demo để dọn sạch lượt quay test)
// ============================================================================

export const resetAllSpinData = async () => {
  return prisma.$transaction([prisma.spin_entries.deleteMany({}), prisma.spin_prizes.updateMany({ data: { awardedCount: 0 } })]);
};
