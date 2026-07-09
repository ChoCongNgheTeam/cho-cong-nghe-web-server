import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListVouchersQuery, ListVoucherUsagesQuery, ListVoucherUsersQuery, CreateVoucherInput, UpdateVoucherInput } from "./voucher.validation";

// SELECT OBJECTS

const selectVoucherCard = {
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
  isActive: true,
  priority: true,
  createdAt: true,
  voucherUsers: {
    select: { id: true },
    take: 1,
  },
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

/**
 * Resolve targetName cho danh sách target theo batch (tránh N+1 query).
 * Gộp targetId theo từng targetType rồi query 1 lần bằng `findMany` + Map,
 * thay vì gọi `findUnique` riêng lẻ trong loop.
 */
const resolveTargetNames = async (targets: { id: string; targetType: string; targetId: string | null }[]) => {
  const idsByType: Record<"BRAND" | "CATEGORY" | "PRODUCT", string[]> = { BRAND: [], CATEGORY: [], PRODUCT: [] };
  for (const target of targets) {
    if (target.targetId && target.targetType in idsByType) {
      idsByType[target.targetType as "BRAND" | "CATEGORY" | "PRODUCT"].push(target.targetId);
    }
  }

  const [brands, categories, products] = await Promise.all([
    idsByType.BRAND.length ? prisma.brands.findMany({ where: { id: { in: idsByType.BRAND } }, select: { id: true, name: true } }) : [],
    idsByType.CATEGORY.length ? prisma.categories.findMany({ where: { id: { in: idsByType.CATEGORY } }, select: { id: true, name: true } }) : [],
    idsByType.PRODUCT.length ? prisma.products.findMany({ where: { id: { in: idsByType.PRODUCT } }, select: { id: true, name: true } }) : [],
  ]);

  const nameMap = new Map<string, string>();
  for (const item of [...brands, ...categories, ...products]) nameMap.set(item.id, item.name);

  return targets.map((target) => ({
    ...target,
    targetName: target.targetId ? nameMap.get(target.targetId) : undefined,
  }));
};
// QUERY BUILDERS

// Điều kiện where cho từng nhóm trạng thái voucher — dùng chung giữa filter danh sách
// và tính statusCounts trong `findAll`, tránh 2 nơi định nghĩa lệch nhau.
const buildStatusWhere = (status: "active" | "inactive" | "expired" | "upcoming", now: Date): Prisma.vouchersWhereInput => {
  switch (status) {
    case "active":
      return { isActive: true, AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }] };
    case "inactive":
      return { isActive: false };
    case "expired":
      return { endDate: { lt: now } };
    case "upcoming":
      return { isActive: true, startDate: { gt: now } };
  }
};

const buildVoucherWhere = (query: ListVouchersQuery, onlyActive = false): Prisma.vouchersWhereInput => {
  const now = new Date();
  const where: Prisma.vouchersWhereInput = { deletedAt: null };

  if (onlyActive) {
    Object.assign(where, buildStatusWhere("active", now));
  } else if (query.status) {
    Object.assign(where, buildStatusWhere(query.status, now));
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [{ code: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.discountType) {
    where.discountType = query.discountType;
  }

  return where;
};

// FIND METHODS

export const findAll = async (query: ListVouchersQuery) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;
  const where = buildVoucherWhere(query, false);
  where.voucherUsers = { none: {} };
  const now = new Date();
  const baseWhere: Prisma.vouchersWhereInput = { deletedAt: null };

  const [data, total, activeCount, inactiveCount, expiredCount, upcomingCount] = await prisma.$transaction([
    prisma.vouchers.findMany({
      where,
      select: selectVoucherCard,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.vouchers.count({ where }),
    prisma.vouchers.count({ where: { ...baseWhere, ...buildStatusWhere("active", now) } }),
    prisma.vouchers.count({ where: { ...baseWhere, ...buildStatusWhere("inactive", now) } }),
    prisma.vouchers.count({ where: { ...baseWhere, ...buildStatusWhere("expired", now) } }),
    prisma.vouchers.count({ where: { ...baseWhere, ...buildStatusWhere("upcoming", now) } }),
  ]);

  const statusCounts = {
    ALL: activeCount + inactiveCount,
    active: activeCount,
    inactive: inactiveCount,
    expired: expiredCount,
    upcoming: upcomingCount,
  };

  return { data, page, limit, total, totalPages: Math.ceil(total / limit), statusCounts };
};

/** Thùng rác */
export const findDeleted = async () => {
  return prisma.vouchers.findMany({
    where: { deletedAt: { not: null } },
    select: selectVoucherCard,
    orderBy: { deletedAt: "desc" },
  });
};

export const findById = async (id: string, includeDeleted = false) => {
  const voucher = await prisma.vouchers.findFirst({
    where: { id, ...(!includeDeleted && { deletedAt: null }) },
    select: selectVoucherDetail,
  });
  if (!voucher) return null;
  return { ...voucher, targets: await resolveTargetNames(voucher.targets) };
};

export const findByCode = async (code: string) => {
  const voucher = await prisma.vouchers.findFirst({
    where: { code: code.toUpperCase(), deletedAt: null },
    select: selectVoucherDetail,
  });
  if (!voucher) return null;
  return { ...voucher, targets: await resolveTargetNames(voucher.targets) };
};

export const findUserVouchers = async (userId: string) => {
  const voucherUsers = await prisma.voucher_user.findMany({
    where: { userId, voucher: { deletedAt: null } },
    include: { voucher: { select: selectVoucherDetail } },
  });

  return voucherUsers.map((vu) => ({
    ...vu.voucher,
    userVoucherData: { maxUses: vu.maxUses, usedCount: vu.usedCount },
  }));
};

export const findUserVoucherUsage = (userId: string, voucherId: string) =>
  prisma.voucher_user.findUnique({
    where: { voucherId_userId: { voucherId, userId } },
  });

export const hasVoucherUsers = (voucherId: string) =>
  prisma.voucher_user.count({
    where: { voucherId },
  });

export const countVoucherUsage = (userId: string, voucherId: string) =>
  prisma.voucher_usages.count({
    where: { userId, voucherId },
  });

export const checkVoucherCode = async (code: string, excludeId?: string) => {
  const voucher = await prisma.vouchers.findFirst({
    where: { code: code.toUpperCase(), deletedAt: null, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return !!voucher;
};

// CHECKS

/** Đếm số user thực sự tồn tại trong danh sách id — dùng để validate trước khi assign/tạo voucher riêng tư. */
export const countExistingUsers = (userIds: string[]) => prisma.users.count({ where: { id: { in: userIds } } });

/** Voucher đã từng được dùng trong lịch sử đơn hàng chưa — chặn hard delete nếu > 0. */
export const countUsagesByVoucher = (voucherId: string) => prisma.voucher_usages.count({ where: { voucherId } });

/** Voucher đang được áp dụng trong đơn hàng nào không — chặn hard delete nếu > 0. */
export const countOrdersByVoucher = (voucherId: string) => prisma.orders.count({ where: { voucherId } });

/** Assignment riêng tư của 1 user cho voucher, dùng khi revoke. */
export const findVoucherUserAssignment = (voucherId: string, userId: string) => prisma.voucher_user.findUnique({ where: { voucherId_userId: { voucherId, userId } } });

// CREATE / UPDATE

export const create = async (data: CreateVoucherInput) => {
  const { targets, userIds, maxUsesPerUser, ...voucherData } = data;

  return prisma.vouchers.create({
    data: {
      ...voucherData,
      targets: { create: targets || [] },
      ...(userIds &&
        userIds.length > 0 && {
          voucherUsers: {
            create: userIds.map((userId) => ({
              userId,
              maxUses: maxUsesPerUser || 1,
            })),
          },
        }),
    },
    select: selectVoucherDetail,
  });
};

export const update = async (id: string, data: UpdateVoucherInput) => {
  const { targets, ...updateData } = data;
  if (targets !== undefined) {
    await prisma.voucher_targets.deleteMany({ where: { voucherId: id } });
  }
  const voucher = await prisma.vouchers.update({
    where: { id },
    data: {
      ...updateData,
      ...(targets !== undefined && { targets: { create: targets } }),
    },
    select: selectVoucherDetail,
  });
  return { ...voucher, targets: await resolveTargetNames(voucher.targets) };
};
// SOFT DELETE / RESTORE / HARD DELETE

export const softDelete = async (id: string, deletedBy: string) => {
  return prisma.vouchers.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
    select: selectVoucherCard,
  });
};

export const bulkSoftDelete = async (ids: string[], deletedBy: string) => {
  return prisma.vouchers.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy },
  });
};

export const restore = async (id: string) => {
  return prisma.vouchers.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectVoucherDetail,
  });
};

export const hardDelete = async (id: string) => {
  return prisma.vouchers.delete({ where: { id } });
};

// ASSIGN TO USERS

export const assignToUsers = async (voucherId: string, userIds: string[], maxUsesPerUser: number) => {
  await prisma.voucher_user.createMany({
    data: userIds.map((userId) => ({ voucherId, userId, maxUses: maxUsesPerUser, usedCount: 0 })),
    skipDuplicates: true,
  });
  return { success: true, assigned: userIds.length };
};

// INCREMENT USAGE

// TODO: chưa được service/controller nào gọi trong module này. Giữ lại vì dự tính
// module order/checkout sẽ dùng khi xác nhận đơn hàng áp voucher thành công.
// export const incrementUsage = async (voucherId: string, userId: string) => {
//   return prisma.$transaction(async (tx) => {
//     await tx.vouchers.update({ where: { id: voucherId }, data: { usesCount: { increment: 1 } } });
//
//     const userVoucher = await tx.voucher_user.findUnique({
//       where: { voucherId_userId: { voucherId, userId } },
//     });
//
//     if (userVoucher) {
//       await tx.voucher_user.update({
//         where: { voucherId_userId: { voucherId, userId } },
//         data: { usedCount: { increment: 1 } },
//       });
//     }
//   });
// };

// USAGE TRACKING

// TODO: chưa được service/controller nào gọi trong module này. Giữ lại vì dự tính
// module order/checkout sẽ dùng để ghi nhận lịch sử sử dụng voucher.
// export const createUsageRecord = async (voucherId: string, userId: string, orderId: string) => {
//   return prisma.voucher_usages.create({ data: { voucherId, userId, orderId } });
// };

// FOR PRICING

// TODO: chưa được service/controller nào gọi trong module này. Giữ lại vì dự tính
// module order/pricing sẽ dùng để tính giá khi checkout áp voucher bằng code.
// export const getVoucherByCode = async (code: string, userId?: string) => {
//   const now = new Date();
//
//   const voucher = await prisma.vouchers.findFirst({
//     where: {
//       code,
//       isActive: true,
//       deletedAt: null,
//       OR: [
//         { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
//         { AND: [{ startDate: null }, { endDate: null }] },
//         { AND: [{ startDate: { lte: now } }, { endDate: null }] },
//         { AND: [{ startDate: null }, { endDate: { gte: now } }] },
//       ],
//     },
//     select: {
//       id: true,
//       code: true,
//       description: true,
//       discountType: true,
//       discountValue: true,
//       minOrderValue: true,
//       maxUses: true,
//       maxUsesPerUser: true,
//       maxDiscountValue: true,
//       usesCount: true,
//       startDate: true,
//       endDate: true,
//       priority: true,
//       isActive: true,
//       targets: { select: { id: true, targetType: true, targetId: true } },
//     },
//   });
//
//   if (!voucher) return null;
//
//   let userUsedCount = 0;
//   let userMaxUses: number | undefined;
//
//   if (userId) {
//     const voucherUser = await prisma.voucher_user.findUnique({
//       where: { voucherId_userId: { voucherId: voucher.id, userId } },
//       select: { maxUses: true, usedCount: true },
//     });
//
//     if (voucherUser) {
//       userMaxUses = voucherUser.maxUses;
//       userUsedCount = voucherUser.usedCount;
//     } else {
//       userUsedCount = await prisma.voucher_usages.count({ where: { voucherId: voucher.id, userId } });
//     }
//   }
//
//   return {
//     id: voucher.id,
//     code: voucher.code,
//     description: voucher.description,
//     discountType: voucher.discountType,
//     discountValue: Number(voucher.discountValue),
//     minOrderValue: Number(voucher.minOrderValue),
//     maxUses: voucher.maxUses,
//     maxUsesPerUser: voucher.maxUsesPerUser,
//     maxDiscountValue: voucher.maxDiscountValue ? Number(voucher.maxDiscountValue) : null,
//     usesCount: voucher.usesCount,
//     startDate: voucher.startDate,
//     endDate: voucher.endDate,
//     priority: voucher.priority,
//     isActive: voucher.isActive,
//     targets: voucher.targets.map((t) => ({ id: t.id, targetType: t.targetType, targetId: t.targetId })),
//     userUsedCount,
//     userMaxUses,
//   };
// };

// USAGES

export const findAllUsages = async (query: ListVoucherUsagesQuery) => {
  const { page, limit, voucherId, userId, orderId, dateFrom, dateTo, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.voucher_usagesWhereInput = {};
  if (voucherId) where.voucherId = voucherId;
  if (userId) where.userId = userId;
  if (orderId) where.orderId = orderId;
  if (dateFrom || dateTo) {
    where.usedAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }),
    };
  }

  const [data, total] = await prisma.$transaction([
    prisma.voucher_usages.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true,
        usedAt: true,
        voucher: { select: { id: true, code: true, discountType: true, discountValue: true } },
        user: { select: { id: true, email: true, fullName: true } },
        order: { select: { id: true, orderCode: true, totalAmount: true } },
      },
    }),
    prisma.voucher_usages.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// VOUCHER USERS (private assignments)

export const findAllVoucherUsers = async (query: ListVoucherUsersQuery) => {
  const { page, limit, voucherId, userId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.voucher_userWhereInput = {};
  if (voucherId) where.voucherId = voucherId;
  if (userId) where.userId = userId;

  const [data, total] = await prisma.$transaction([
    prisma.voucher_user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        maxUses: true,
        usedCount: true,
        createdAt: true,
        voucher: { select: { id: true, code: true, discountType: true, discountValue: true, endDate: true, isActive: true } },
        user: { select: { id: true, email: true, fullName: true } },
      },
    }),
    prisma.voucher_user.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const revokeVoucherUser = async (voucherId: string, userId: string) => {
  return prisma.voucher_user.delete({
    where: { voucherId_userId: { voucherId, userId } },
  });
};
