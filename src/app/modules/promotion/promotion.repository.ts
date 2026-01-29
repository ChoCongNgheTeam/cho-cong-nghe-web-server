import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListPromotionsQuery } from "./promotion.validation";

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
  rules: {
    select: {
      id: true,
    },
  },
  targets: {
    select: {
      id: true,
    },
  },
};

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
};

// =====================
// === QUERY BUILDERS ===
// =====================

const buildPromotionWhere = (query: ListPromotionsQuery): Prisma.promotionsWhereInput => {
  const where: Prisma.promotionsWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
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

export const findAll = async (query: ListPromotionsQuery) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = buildPromotionWhere(query);

  const [data, total] = await Promise.all([
    prisma.promotions.findMany({
      where,
      select: selectPromotionCard,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.promotions.count({ where }),
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
  prisma.promotions.findUnique({
    where: { id },
    select: selectPromotionDetail,
  });

export const checkPromotionName = async (name: string) => {
  const promotion = await prisma.promotions.findUnique({
    where: { name },
    select: { id: true },
  });
  return !!promotion;
};

// =====================
// === FIND ACTIVE PROMOTIONS ===
// =====================

export const findActivePromotions = async () => {
  const now = new Date();

  return prisma.promotions.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [{ startDate: null }, { startDate: { lte: now } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ],
    },
    select: selectPromotionDetail,
    orderBy: { priority: "asc" }, // Priority thấp = ưu tiên cao
  });
};

export const findActivePromotionsForProduct = async (productId: string) => {
  const now = new Date();

  return prisma.promotions.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [{ startDate: null }, { startDate: { lte: now } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ],
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
      AND: [
        {
          OR: [{ startDate: null }, { startDate: { lte: now } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ],
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
      AND: [
        {
          OR: [{ startDate: null }, { startDate: { lte: now } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ],
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
// === CREATE/UPDATE/DELETE ===
// =====================

export const create = async (data: any) => {
  const { rules, targets, ...promotionData } = data;

  return prisma.promotions.create({
    data: {
      ...promotionData,
      rules: {
        create: rules || [],
      },
      targets: {
        create: targets || [],
      },
    },
    select: selectPromotionDetail,
  });
};

export const update = async (id: string, data: any) => {
  const { rules, targets, ...updateData } = data;

  // Delete old rules and targets if new ones are provided
  if (rules !== undefined) {
    await prisma.promotion_rules.deleteMany({ where: { promotionId: id } });
  }
  if (targets !== undefined) {
    await prisma.promotion_targets.deleteMany({ where: { promotionId: id } });
  }

  return prisma.promotions.update({
    where: { id },
    data: {
      ...updateData,
      ...(rules !== undefined && {
        rules: {
          create: rules,
        },
      }),
      ...(targets !== undefined && {
        targets: {
          create: targets,
        },
      }),
    },
    select: selectPromotionDetail,
  });
};

export const remove = async (id: string) => {
  // Delete related rules and targets first
  await prisma.promotion_rules.deleteMany({ where: { promotionId: id } });
  await prisma.promotion_targets.deleteMany({ where: { promotionId: id } });

  return prisma.promotions.delete({ where: { id } });
};

/**
 * Lấy tất cả promotions đang active (cho pricing)
 */
export const getActivePromotions = async () => {
  const now = new Date();

  const promotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      OR: [
        {
          AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }],
        },
        {
          AND: [{ startDate: null }, { endDate: null }],
        },
        {
          AND: [{ startDate: { lte: now } }, { endDate: null }],
        },
        {
          AND: [{ startDate: null }, { endDate: { gte: now } }],
        },
      ],
    },
    select: {
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
    },
    orderBy: {
      priority: "asc", // Priority thấp = ưu tiên cao
    },
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
