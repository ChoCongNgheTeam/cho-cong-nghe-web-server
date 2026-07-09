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

// Gộp làm 1 select duy nhất (superset field của Admin + Detail cũ) thay vì 2 select
// khác nhau chọn theo `isAdmin` (boolean runtime, không phải literal type) — ternary đó
// khiến TS suy ra kiểu trả về là UNION giữa 2 shape khác nhau, gây lỗi truy cập field
// (vd `deletedAt` không tồn tại ở nhánh Detail). Việc ẩn field nhạy cảm với người dùng
// không-admin vẫn được đảm bảo ở tầng transformer (PromotionDetail DTO không có deletedAt/deletedBy).
const selectPromotionFull = {
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
    prisma.promotions.findMany({ where, orderBy, select: selectPromotionFull, skip, take: limit }),
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
    select: selectPromotionFull,
  });
  if (!promotion) return null;
  const targetsWithName = await resolveTargetNames(promotion.targets);
  return { ...promotion, targets: targetsWithName };
};

// Gộp lookup tên brand/category/product theo targetType thành tối đa 3 query
// (findMany + Map by id) thay vì 1 query riêng cho từng target (N+1).
const resolveTargetNames = async <T extends { targetId: string | null; targetType: string }>(targets: T[]): Promise<(T & { targetName?: string })[]> => {
  const idsByType = { BRAND: new Set<string>(), CATEGORY: new Set<string>(), PRODUCT: new Set<string>() } as const;

  for (const target of targets) {
    if (!target.targetId) continue;
    if (target.targetType === "BRAND") idsByType.BRAND.add(target.targetId);
    else if (target.targetType === "CATEGORY") idsByType.CATEGORY.add(target.targetId);
    else if (target.targetType === "PRODUCT") idsByType.PRODUCT.add(target.targetId);
  }

  const [brands, categories, products] = await Promise.all([
    idsByType.BRAND.size ? prisma.brands.findMany({ where: { id: { in: [...idsByType.BRAND] } }, select: { id: true, name: true } }) : Promise.resolve([]),
    idsByType.CATEGORY.size ? prisma.categories.findMany({ where: { id: { in: [...idsByType.CATEGORY] } }, select: { id: true, name: true } }) : Promise.resolve([]),
    idsByType.PRODUCT.size ? prisma.products.findMany({ where: { id: { in: [...idsByType.PRODUCT] } }, select: { id: true, name: true } }) : Promise.resolve([]),
  ]);

  const nameById = new Map<string, string>();
  for (const b of brands) nameById.set(b.id, b.name);
  for (const c of categories) nameById.set(c.id, c.name);
  for (const p of products) nameById.set(p.id, p.name);

  return targets.map((target) => ({
    ...target,
    targetName: target.targetId ? nameById.get(target.targetId) : undefined,
  }));
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
    select: selectPromotionFull,
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
    select: selectPromotionFull,
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
    select: selectPromotionFull,
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
    select: selectPromotionFull,
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
    select: selectPromotionFull,
  });
  clearPromotionsCache();
  return result;
};

export const update = async (id: string, data: UpdatePromotionInput) => {
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
    select: selectPromotionFull,
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

// Bulk soft delete — dùng cho route DELETE /admin/bulk
export const softDeleteMany = async (ids: string[], deletedById: string) => {
  const result = await prisma.promotions.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById, isActive: false },
  });
  clearPromotionsCache();
  return result;
};

export const restore = async (id: string) => {
  const result = await prisma.promotions.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectPromotionFull,
  });
  clearPromotionsCache();
  return result;
};

export const hardDelete = async (id: string) => {
  const result = await prisma.promotions.delete({ where: { id } });
  clearPromotionsCache();
  return result;
};

export const findAllDeleted = async (options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.promotions.findMany({
      where: { deletedAt: { not: null } },
      select: selectPromotionFull,
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
  // Check cache trước
  const now = Date.now();
  if (promotionsCache && now - promotionsCacheTime < PROMOTIONS_CACHE_TTL) {
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
    select: selectPromotionFull,
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

  // Lưu vào cache
  promotionsCache = result;
  promotionsCacheTime = Date.now();

  return result;
};

// Clear cache — gọi sau mọi mutation ảnh hưởng danh sách active promotions
// (create/update/softDelete/softDeleteMany/restore/hardDelete)
export const clearPromotionsCache = () => {
  promotionsCache = null;
  promotionsCacheTime = 0;
};
