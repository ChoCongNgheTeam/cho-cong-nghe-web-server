import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListVouchersQuery } from "./voucher.validation";

// =====================
// === SELECT OBJECTS ===
// =====================

const selectVoucherCard = {
  id: true,
  code: true,
  description: true,
  discountType: true,
  discountValue: true,
  minOrderValue: true,
  maxDiscountValue: true,
  maxUses: true,
  usesCount: true,
  startDate: true,
  endDate: true,
  isActive: true,
  createdAt: true,
};

const selectVoucherDetail = {
  id: true,
  code: true,
  description: true,
  discountType: true,
  discountValue: true,
  minOrderValue: true,
  maxDiscountValue: true,
  maxUses: true,
  maxUsesPerUser: true,
  usesCount: true,
  startDate: true,
  endDate: true,
  priority: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  targets: {
    select: { id: true, targetType: true, targetId: true },
  },
};

// =====================
// === QUERY BUILDERS ===
// =====================

const buildVoucherWhere = (query: ListVouchersQuery, onlyActive = false): Prisma.vouchersWhereInput => {
  const where: Prisma.vouchersWhereInput = {
    // Mặc định loại trừ soft-deleted
    deletedAt: null,
  };

  if (onlyActive) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [{ code: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.discountType) {
    where.discountType = query.discountType;
  }

  if (query.isExpired !== undefined) {
    const now = new Date();
    if (query.isExpired) {
      where.endDate = { lt: now };
    } else {
      where.OR = [{ endDate: null }, { endDate: { gte: now } }];
    }
  }

  return where;
};

// =====================
// === FIND METHODS ===
// =====================

export const findAll = async (query: ListVouchersQuery) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;
  const where = buildVoucherWhere(query);

  const [data, total] = await Promise.all([
    prisma.vouchers.findMany({
      where,
      select: selectVoucherCard,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.vouchers.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/** Thùng rác — chỉ các voucher đã bị soft-delete */
export const findDeleted = async () => {
  return prisma.vouchers.findMany({
    where: { deletedAt: { not: null } },
    select: selectVoucherCard,
    orderBy: { deletedAt: "desc" },
  });
};

export const findById = (id: string, includeDeleted = false) =>
  prisma.vouchers.findFirst({
    where: { id, ...(!includeDeleted && { deletedAt: null }) },
    select: selectVoucherDetail,
  });

export const findByCode = (code: string) =>
  prisma.vouchers.findFirst({
    where: { code: code.toUpperCase(), deletedAt: null },
    select: selectVoucherDetail,
  });

export const findUserVouchers = async (userId: string) => {
  const voucherUsers = await prisma.voucher_user.findMany({
    where: {
      userId,
      voucher: {
        deletedAt: null,
      },
    },
    include: {
      voucher: {
        select: selectVoucherDetail,
      },
    },
  });

  return voucherUsers.map((vu) => ({
    ...vu.voucher,
    userVoucherData: {
      maxUses: vu.maxUses,
      usedCount: vu.usedCount,
    },
  }));
};
export const findUserVoucherUsage = (userId: string, voucherId: string) =>
  prisma.voucher_user.findUnique({
    where: { voucherId_userId: { voucherId, userId } },
  });

export const checkVoucherCode = async (code: string, excludeId?: string) => {
  const voucher = await prisma.vouchers.findFirst({
    where: { code: code.toUpperCase(), deletedAt: null, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return !!voucher;
};

// =====================
// === CREATE / UPDATE ===
// =====================

export const create = async (data: any) => {
  const { targets, userIds, ...voucherData } = data;

  return prisma.vouchers.create({
    data: {
      ...voucherData,
      targets: { create: targets || [] },
      ...(userIds?.length > 0 && {
        voucherUsers: {
          create: userIds.map((userId: string) => ({
            userId,
            maxUses: data.maxUsesPerUser || 1,
          })),
        },
      }),
    },
    select: selectVoucherDetail,
  });
};

export const update = async (id: string, data: any) => {
  const { targets, ...updateData } = data;

  if (targets !== undefined) {
    await prisma.voucher_targets.deleteMany({ where: { voucherId: id } });
  }

  return prisma.vouchers.update({
    where: { id },
    data: {
      ...updateData,
      ...(targets !== undefined && { targets: { create: targets } }),
    },
    select: selectVoucherDetail,
  });
};

// =====================
// === SOFT DELETE / RESTORE / HARD DELETE ===
// =====================

/** Soft delete — ghi deletedAt + deletedBy */
export const softDelete = async (id: string, deletedBy: string) => {
  return prisma.vouchers.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
    select: selectVoucherCard,
  });
};

/** Bulk soft delete */
export const bulkSoftDelete = async (ids: string[], deletedBy: string) => {
  return prisma.vouchers.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy },
  });
};

/** Khôi phục — xoá deletedAt + deletedBy */
export const restore = async (id: string) => {
  return prisma.vouchers.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectVoucherDetail,
  });
};

/**
 * Xoá vĩnh viễn.
 * targets & voucherUsers bị cascade.
 * voucher_usages KHÔNG xoá (audit log).
 */
export const hardDelete = async (id: string) => {
  return prisma.vouchers.delete({ where: { id } });
};

// =====================
// === ASSIGN TO USERS ===
// =====================

export const assignToUsers = async (voucherId: string, userIds: string[], maxUsesPerUser: number) => {
  await prisma.voucher_user.createMany({
    data: userIds.map((userId) => ({ voucherId, userId, maxUses: maxUsesPerUser, usedCount: 0 })),
    skipDuplicates: true,
  });
  return { success: true, assigned: userIds.length };
};

// =====================
// === INCREMENT USAGE ===
// =====================

export const incrementUsage = async (voucherId: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.vouchers.update({
      where: { id: voucherId },
      data: { usesCount: { increment: 1 } },
    });

    const userVoucher = await tx.voucher_user.findUnique({
      where: { voucherId_userId: { voucherId, userId } },
    });

    if (userVoucher) {
      await tx.voucher_user.update({
        where: { voucherId_userId: { voucherId, userId } },
        data: { usedCount: { increment: 1 } },
      });
    }
  });
};

// =====================
// === USAGE TRACKING ===
// =====================

export const createUsageRecord = async (voucherId: string, userId: string, orderId: string) => {
  return prisma.voucher_usages.create({ data: { voucherId, userId, orderId } });
};

// =====================
// === FOR PRICING ===
// =====================

export const getVoucherByCode = async (code: string, userId?: string) => {
  const now = new Date();

  const voucher = await prisma.vouchers.findFirst({
    where: {
      code,
      isActive: true,
      deletedAt: null,
      OR: [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { AND: [{ startDate: null }, { endDate: null }] },
        { AND: [{ startDate: { lte: now } }, { endDate: null }] },
        { AND: [{ startDate: null }, { endDate: { gte: now } }] },
      ],
    },
    select: {
      id: true,
      code: true,
      description: true,
      discountType: true,
      discountValue: true,
      minOrderValue: true,
      maxUses: true,
      maxUsesPerUser: true,
      maxDiscountValue: true,
      usesCount: true,
      startDate: true,
      endDate: true,
      priority: true,
      isActive: true,
      targets: { select: { id: true, targetType: true, targetId: true } },
    },
  });

  if (!voucher) return null;

  let userUsedCount = 0;
  let userMaxUses: number | undefined;

  if (userId) {
    const voucherUser = await prisma.voucher_user.findUnique({
      where: { voucherId_userId: { voucherId: voucher.id, userId } },
      select: { maxUses: true, usedCount: true },
    });

    if (voucherUser) {
      userMaxUses = voucherUser.maxUses;
      userUsedCount = voucherUser.usedCount;
    } else {
      userUsedCount = await prisma.voucher_usages.count({
        where: { voucherId: voucher.id, userId },
      });
    }
  }

  return {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType,
    discountValue: Number(voucher.discountValue),
    minOrderValue: Number(voucher.minOrderValue),
    maxUses: voucher.maxUses,
    maxUsesPerUser: voucher.maxUsesPerUser,
    maxDiscountValue: voucher.maxDiscountValue ? Number(voucher.maxDiscountValue) : null,
    usesCount: voucher.usesCount,
    startDate: voucher.startDate,
    endDate: voucher.endDate,
    priority: voucher.priority,
    isActive: voucher.isActive,
    targets: voucher.targets.map((t) => ({ id: t.id, targetType: t.targetType, targetId: t.targetId })),
    userUsedCount,
    userMaxUses,
  };
};
