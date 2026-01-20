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
  maxUses: true,
  maxUsesPerUser: true,
  usesCount: true,
  startDate: true,
  endDate: true,
  priority: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  actions: {
    select: {
      id: true,
      actionType: true,
      value: true,
      buyQuantity: true,
      getQuantity: true,
      giftProductVariantId: true,
    },
  },
  targets: {
    select: {
      id: true,
      targetType: true,
      targetId: true,
    },
  },
};

// =====================
// === QUERY BUILDERS ===
// =====================

const buildVoucherWhere = (query: ListVouchersQuery): Prisma.vouchersWhereInput => {
  const where: Prisma.vouchersWhereInput = {};

  if (query.search) {
    where.OR = [
      { code: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.discountType) {
    where.discountType = query.discountType;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
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

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const findById = (id: string) =>
  prisma.vouchers.findUnique({
    where: { id },
    select: selectVoucherDetail,
  });

export const findByCode = (code: string) =>
  prisma.vouchers.findUnique({
    where: { code: code.toUpperCase() },
    select: selectVoucherDetail,
  });

export const findUserVouchers = async (userId: string) => {
  const voucherUsers = await prisma.voucher_user.findMany({
    where: { userId },
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
    where: {
      voucherId_userId: {
        voucherId,
        userId,
      },
    },
  });

export const checkVoucherCode = async (code: string) => {
  const voucher = await prisma.vouchers.findUnique({
    where: { code: code.toUpperCase() },
    select: { id: true },
  });
  return !!voucher;
};

// =====================
// === CREATE/UPDATE/DELETE ===
// =====================

export const create = async (data: any) => {
  const { actions, targets, userIds, ...voucherData } = data;

  return prisma.vouchers.create({
    data: {
      ...voucherData,
      actions: {
        create: actions || [],
      },
      targets: {
        create: targets || [],
      },
      ...(userIds &&
        userIds.length > 0 && {
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
  const { actions, targets, ...updateData } = data;

  // Delete old actions and targets if new ones are provided
  if (actions !== undefined) {
    await prisma.voucher_actions.deleteMany({ where: { voucherId: id } });
  }

  if (targets !== undefined) {
    await prisma.voucher_targets.deleteMany({ where: { voucherId: id } });
  }

  return prisma.vouchers.update({
    where: { id },
    data: {
      ...updateData,
      ...(actions !== undefined && {
        actions: {
          create: actions,
        },
      }),
      ...(targets !== undefined && {
        targets: {
          create: targets,
        },
      }),
    },
    select: selectVoucherDetail,
  });
};

export const remove = async (id: string) => {
  // Delete related records first
  await prisma.voucher_actions.deleteMany({ where: { voucherId: id } });
  await prisma.voucher_targets.deleteMany({ where: { voucherId: id } });
  await prisma.voucher_user.deleteMany({ where: { voucherId: id } });
  // Note: Don't delete voucher_usages to maintain history

  return prisma.vouchers.delete({ where: { id } });
};

// =====================
// === ASSIGN TO USERS ===
// =====================

export const assignToUsers = async (
  voucherId: string,
  userIds: string[],
  maxUsesPerUser: number,
) => {
  // Create voucher_user records
  await prisma.voucher_user.createMany({
    data: userIds.map((userId) => ({
      voucherId,
      userId,
      maxUses: maxUsesPerUser,
      usedCount: 0,
    })),
    skipDuplicates: true, // Skip if already exists
  });

  return { success: true, assigned: userIds.length };
};

// =====================
// === INCREMENT USAGE ===
// =====================

export const incrementUsage = async (voucherId: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    // Increment voucher total uses
    await tx.vouchers.update({
      where: { id: voucherId },
      data: { usesCount: { increment: 1 } },
    });

    // Increment user-specific uses if exists
    const userVoucher = await tx.voucher_user.findUnique({
      where: {
        voucherId_userId: {
          voucherId,
          userId,
        },
      },
    });

    if (userVoucher) {
      await tx.voucher_user.update({
        where: {
          voucherId_userId: {
            voucherId,
            userId,
          },
        },
        data: { usedCount: { increment: 1 } },
      });
    }
  });
};

// =====================
// === USAGE TRACKING ===
// =====================

export const createUsageRecord = async (voucherId: string, userId: string, orderId: string) => {
  return prisma.voucher_usages.create({
    data: {
      voucherId,
      userId,
      orderId,
    },
  });
};
