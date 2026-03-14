import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListPromotionsQuery, CreatePromotionInput, UpdatePromotionInput } from "./promotion.validation";

// =====================
// === SELECT OBJECTS ===
// =====================

// Select dùng cho public/listing — gọn nhẹ
const selectPromotionCard = {
  id: true,
  name: true,
  description: true,
  priority: true,
  isActive: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  rules: {
    select: { id: true },
  },
  targets: {
    select: { id: true },
  },
} satisfies Prisma.promotionsSelect;

// Select dùng cho admin — thêm soft delete metadata + full fields
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
    },
  },
} satisfies Prisma.promotionsSelect;

// Select dùng cho detail — đầy đủ nhất (public detail)
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
    },
  },
} satisfies Prisma.promotionsSelect;

// =====================
// === QUERY BUILDERS ===
// =====================

const buildPromotionWhere = (query: ListPromotionsQuery, isAdmin: boolean): Prisma.promotionsWhereInput => {
  const where: Prisma.promotionsWhereInput = {};

  // Soft delete filter
  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.isExpired !== undefined) {
    const now = new Date();
    if (query.isExpired) {
      where.endDate = { lt: now };
    } else {
      where.AND = [
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ];
    }
  }

  // Date range — filter theo createdAt
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom && { gte: query.dateFrom }),
      ...(query.dateTo && {
        lte: new Date(new Date(query.dateTo).setHours(23, 59, 59, 999)),
      }),
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

  const [data, total] = await prisma.$transaction([prisma.promotions.findMany({ where, orderBy, select: selectPromotionAdmin, skip, take: limit }), prisma.promotions.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;
  return prisma.promotions.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectPromotionAdmin : selectPromotionDetail,
  });
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
      targets: {
        some: {
          OR: [{ targetType: "ALL" }, { targetType: "PRODUCT", targetId: productId }],
        },
      },
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
      targets: {
        some: {
          OR: [{ targetType: "ALL" }, { targetType: "CATEGORY", targetId: categoryId }],
        },
      },
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
      targets: {
        some: {
          OR: [{ targetType: "ALL" }, { targetType: "BRAND", targetId: brandId }],
        },
      },
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

  return prisma.promotions.create({
    data: {
      ...promotionData,
      rules: { create: rules ?? [] },
      targets: { create: targets ?? [] },
    },
    select: selectPromotionAdmin,
  });
};

export const update = async (id: string, data: UpdatePromotionInput) => {
  const { rules, targets, ...updateData } = data;

  // Replace rules/targets nếu được cung cấp (Cascade đã lo xóa cũ)
  if (rules !== undefined) {
    await prisma.promotion_rules.deleteMany({ where: { promotionId: id } });
  }
  if (targets !== undefined) {
    await prisma.promotion_targets.deleteMany({ where: { promotionId: id } });
  }

  return prisma.promotions.update({
    where: { id, deletedAt: null },
    data: {
      ...updateData,
      ...(rules !== undefined && { rules: { create: rules } }),
      ...(targets !== undefined && { targets: { create: targets } }),
    },
    select: selectPromotionAdmin,
  });
};

// =====================
// === SOFT DELETE / RESTORE / HARD DELETE ===
// =====================

// Soft delete — Admin only
export const softDelete = async (id: string, deletedById: string) => {
  return prisma.promotions.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedById,
      isActive: false,
    },
  });
};

// Restore từ trash — Admin only
export const restore = async (id: string) => {
  return prisma.promotions.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectPromotionAdmin,
  });
};

// Hard delete — Admin only, CHỈ sau khi đã soft delete
// Rules & targets tự xóa qua Cascade
export const hardDelete = async (id: string) => {
  return prisma.promotions.delete({ where: { id } });
};

// Lấy danh sách promotion đã soft delete — Admin only (trang trash)
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
  const now = new Date();

  const promotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
        { AND: [{ startDate: null }, { endDate: null }] },
        { AND: [{ startDate: { lte: now } }, { endDate: null }] },
        { AND: [{ startDate: null }, { endDate: { gte: now } }] },
      ],
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" },
  });

  return promotions.map((promo) => ({
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
    })),
  }));
};
