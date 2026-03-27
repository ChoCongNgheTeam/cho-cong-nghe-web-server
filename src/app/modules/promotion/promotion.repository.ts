import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListPromotionsQuery, CreatePromotionInput, UpdatePromotionInput } from "./promotion.validation";

// =====================
// === CACHE CONFIG ===
// =====================
let promotionsCache: any[] | null = null;
let promotionsCacheTime = 0;
const PROMOTIONS_CACHE_TTL = 5 * 60 * 1000; // Cache 5 phút

// =====================
// === SELECT OBJECTS ===
// =====================

const selectPromotionCard = {
  id: true,
  name: true,
  description: true,
  priority: true,
  isActive: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  rules: { select: { id: true } },
  targets: { select: { id: true } },
} satisfies Prisma.promotionsSelect;

const selectPromotionAdmin = {
  id: true,
  name: true,
  description: true,
  priority: true,
  isActive: true,
  startDate: true,
  endDate: true,
  minOrderValue: true,
  maxDiscountValue: true,
  usageLimit: true,
  usedCount: true,
  createdAt: true,
  deletedAt: true,
  deletedBy: true,
  rules: {
    select: {
      id: true,
      actionType: true,
      discountValue: true,
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
      targetCode: true,
      targetValue: true,
    },
  },
} satisfies Prisma.promotionsSelect;

const selectPromotionDetail = {
  id: true,
  name: true,
  description: true,
  priority: true,
  isActive: true,
  startDate: true,
  endDate: true,
  minOrderValue: true,
  maxDiscountValue: true,
  applyType: true,
  stackingGroup: true,
  stopProcessing: true,
  usageLimit: true,
  usedCount: true,
  createdAt: true,
  rules: {
    select: {
      id: true,
      actionType: true,
      discountValue: true,
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
      targetCode: true,
      targetValue: true,
    },
  },
} satisfies Prisma.promotionsSelect;

// =====================
// === QUERY BUILDERS ===
// =====================

const buildPromotionWhere = (query: ListPromotionsQuery, isAdmin: boolean): Prisma.promotionsWhereInput => {
  const now = new Date();
  const where: Prisma.promotionsWhereInput = {};

  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  // ← THAY TOÀN BỘ status filter cũ bằng cái này
  if (query.status) {
    switch (query.status) {
      case "active":
        // isActive=true + đã bắt đầu + chưa hết hạn
        where.isActive = true;
        where.AND = [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }];
        break;

      case "inactive":
        where.isActive = false;
        break;

      case "expired":
        // endDate đã qua (dù isActive true hay false)
        where.endDate = { lt: now };
        break;

      case "upcoming":
        // isActive=true + startDate chưa tới
        where.isActive = true;
        where.startDate = { gt: now };
        break;
    }
  } else if (query.isActive !== undefined) {
    // Fallback nếu FE truyền isActive trực tiếp
    where.isActive = query.isActive;
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom && { gte: query.dateFrom }),
      ...(query.dateTo && { lte: new Date(new Date(query.dateTo).setHours(23, 59, 59, 999)) }),
    };
  }

  return where;
};

const buildPromotionOrderBy = (query: ListPromotionsQuery): Prisma.promotionsOrderByWithRelationInput[] => {
  return [{ [query.sortBy]: query.sortOrder }];
};

// =====================
// === FIND METHODS ===
// =====================

export const findAllPublic = async (query: ListPromotionsQuery) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const where = buildPromotionWhere(query, false);
  const orderBy = buildPromotionOrderBy(query);

  const [data, total] = await prisma.$transaction([prisma.promotions.findMany({ where, orderBy, select: selectPromotionCard, skip, take: limit }), prisma.promotions.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllAdmin = async (query: ListPromotionsQuery) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const where = buildPromotionWhere(query, true);
  const orderBy = buildPromotionOrderBy(query);
  const now = new Date();
  const base: Prisma.promotionsWhereInput = { deletedAt: null };

  const [data, total, activeCount, inactiveCount, expiredCount, upcomingCount] = await prisma.$transaction([
    prisma.promotions.findMany({ where, orderBy, select: selectPromotionAdmin, skip, take: limit }),
    prisma.promotions.count({ where }),

    // active: isActive=true + đã bắt đầu + chưa hết hạn
    prisma.promotions.count({
      where: {
        ...base,
        isActive: true,
        AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
    }),

    // inactive: isActive=false (không tính expired)
    prisma.promotions.count({
      where: {
        ...base,
        isActive: false,
        OR: [{ endDate: null }, { endDate: { gte: now } }], // chưa hết hạn
      },
    }),

    // expired: endDate đã qua
    prisma.promotions.count({
      where: { ...base, endDate: { lt: now } },
    }),

    // upcoming: isActive=true + startDate chưa tới
    prisma.promotions.count({
      where: { ...base, isActive: true, startDate: { gt: now } },
    }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    statusCounts: {
      ALL: total,
      active: activeCount,
      inactive: inactiveCount,
      expired: expiredCount,
      upcoming: upcomingCount,
    },
  };
};

export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;
  const promotion = await prisma.promotions.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectPromotionAdmin : selectPromotionDetail,
  });
  if (!promotion) return null;
  const targetsWithName = await Promise.all(
    promotion.targets.map(async (target) => {
      if (!target.targetId) return { ...target, targetName: undefined };
      let targetName: string | undefined;
      switch (target.targetType) {
        case "BRAND":
          targetName = (
            await prisma.brands.findUnique({
              where: { id: target.targetId },
              select: { name: true },
            })
          )?.name;
          break;
        case "CATEGORY":
          targetName = (
            await prisma.categories.findUnique({
              where: { id: target.targetId },
              select: { name: true },
            })
          )?.name;
          break;
        case "PRODUCT":
          targetName = (
            await prisma.products.findUnique({
              where: { id: target.targetId },
              select: { name: true },
            })
          )?.name;
          break;
      }

      return { ...target, targetName };
    }),
  );
  return { ...promotion, targets: targetsWithName };
};

export const checkPromotionName = async (name: string, excludeId?: string): Promise<boolean> => {
  const promotion = await prisma.promotions.findFirst({
    where: { name, deletedAt: null },
    select: { id: true },
  });
  if (!promotion) return false;
  if (excludeId && promotion.id === excludeId) return false;
  return true;
};

// =====================
// === ACTIVE PROMOTIONS (for pricing engine) ===
// =====================

export const findActivePromotions = async () => {
  const now = new Date();
  return prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" },
  });
};

export const findActivePromotionsForProduct = async (productId: string) => {
  const now = new Date();
  return prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      targets: { some: { OR: [{ targetType: "ALL" }, { targetType: "PRODUCT", targetId: productId }] } },
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" },
  });
};

export const findActivePromotionsForCategory = async (categoryId: string) => {
  const now = new Date();
  return prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      targets: { some: { OR: [{ targetType: "ALL" }, { targetType: "CATEGORY", targetId: categoryId }] } },
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" },
  });
};

export const findActivePromotionsForBrand = async (brandId: string) => {
  const now = new Date();
  return prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      targets: { some: { OR: [{ targetType: "ALL" }, { targetType: "BRAND", targetId: brandId }] } },
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" },
  });
};

// =====================
// === CREATE / UPDATE ===
// =====================

export const create = async (data: CreatePromotionInput) => {
  const { rules, targets, ...promotionData } = data;
  const result = await prisma.promotions.create({
    data: {
      ...promotionData,
      rules: { create: rules ?? [] },
      targets: { create: targets ?? [] },
    },
    select: selectPromotionAdmin,
  });
  clearPromotionsCache();
  return result;
};

export const update = async (id: string, data: UpdatePromotionInput) => {
  console.log(data);

  const { rules, targets, ...updateData } = data;

  if (rules !== undefined) {
    await prisma.promotion_rules.deleteMany({ where: { promotionId: id } });
  }
  if (targets !== undefined) {
    await prisma.promotion_targets.deleteMany({ where: { promotionId: id } });
  }

  const result = await prisma.promotions.update({
    where: { id, deletedAt: null },
    data: {
      ...updateData,
      ...(rules !== undefined && { rules: { create: rules } }),
      ...(targets !== undefined && { targets: { create: targets } }),
    },
    select: selectPromotionAdmin,
  });
  clearPromotionsCache();
  return result;
};

// =====================
// === SOFT DELETE / RESTORE / HARD DELETE ===
// =====================

export const softDelete = async (id: string, deletedById: string) => {
  const result = await prisma.promotions.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById, isActive: false },
  });
  clearPromotionsCache();
  return result;
};

export const restore = async (id: string) => {
  return prisma.promotions.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectPromotionAdmin,
  });
};

export const hardDelete = async (id: string) => {
  return prisma.promotions.delete({ where: { id } });
};

export const findAllDeleted = async (options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.promotions.findMany({
      where: { deletedAt: { not: null } },
      select: selectPromotionAdmin,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.promotions.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { data, total, page, limit };
};

// =====================
// === ACTIVE PROMOTIONS (for pricing — raw with transform) ===
// =====================

export const getActivePromotions = async () => {
  // ✅ Check cache trước
  const now = Date.now();
  if (promotionsCache && (now - promotionsCacheTime) < PROMOTIONS_CACHE_TTL) {
    console.log("[Cache] Sử dụng cached promotions");
    return promotionsCache;
  }

  const nowDate = new Date();
  const promotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { AND: [{ startDate: { lte: nowDate } }, { endDate: { gte: nowDate } }] },
        { AND: [{ startDate: null }, { endDate: null }] },
        { AND: [{ startDate: { lte: nowDate } }, { endDate: null }] },
        { AND: [{ startDate: null }, { endDate: { gte: nowDate } }] },
      ],
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" },
  });

  const result = promotions.map((promo) => ({
    id: promo.id,
    name: promo.name,
    description: promo.description,
    priority: promo.priority,
    isActive: promo.isActive,
    startDate: promo.startDate,
    endDate: promo.endDate,
    minOrderValue: promo.minOrderValue ? Number(promo.minOrderValue) : null,
    maxDiscountValue: promo.maxDiscountValue ? Number(promo.maxDiscountValue) : null,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount,
    applyType: promo.applyType,
    stackingGroup: promo.stackingGroup,
    stopProcessing: promo.stopProcessing,
    rules: promo.rules.map((r) => ({
      id: r.id,
      promotionId: promo.id,
      actionType: r.actionType,
      discountValue: r.discountValue ? Number(r.discountValue) : null,
      buyQuantity: r.buyQuantity,
      getQuantity: r.getQuantity,
      giftProductVariantId: r.giftProductVariantId,
    })),
    targets: promo.targets.map((t) => ({
      id: t.id,
      promotionId: promo.id,
      targetType: t.targetType,
      targetId: t.targetId,
      targetCode: t.targetCode,
      targetValue: t.targetValue,
    })),
  }));

  // ✅ Lưu vào cache
  promotionsCache = result;
  promotionsCacheTime = Date.now();
  
  return result;
};

// ✅ Hàm clear cache khi update promotion
export const clearPromotionsCache = () => {
  promotionsCache = null;
  promotionsCacheTime = 0;
  console.log("[Cache] Cleared promotions cache");
};
