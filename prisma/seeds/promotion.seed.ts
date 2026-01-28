import { PrismaClient, TargetType, PromotionActionType } from "@prisma/client";

type PromotionTarget = {
  targetType: TargetType;
  targetId?: string; // product variant id, category id, brand id, ...
  buyQuantity?: number; // dùng cho BUY_X_GET_Y
  actionType: PromotionActionType;
  discountValue?: string;
  giftProductVariantId?: string;
  getQuantity?: number;
};

const promotionData: {
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;

  minOrderValue?: string;
  maxDiscountValue?: string;
  usageLimit?: number;

  targets: PromotionTarget[];
}[] = [
  {
    name: "APPLE_IPHONE_GIAM_400K",
    description: "Giảm ngay 400.000đ cho sản phẩm Apple iPhone",
    priority: 30,
    isActive: true,
    startDate: new Date("2026-01-27"),
    endDate: new Date("2026-02-28"),

    targets: [
      {
        targetType: TargetType.BRAND,
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "400000.00",
      },
    ],
  },
  {
    name: "APPLE_IPHONE_TANG_OP_LUNG",
    description: "Tặng ốp lưng khi mua iPhone",
    priority: 25,
    isActive: true,

    targets: [
      {
        targetType: TargetType.BRAND,
        actionType: PromotionActionType.GIFT_PRODUCT,
        getQuantity: 1,
      },
    ],
  },
  {
    name: "APPLE_IPHONE_BUY_GET_AIRPODS_500K",
    description: "Lì xì 500.000đ khi mua kèm AirPods",
    priority: 20,
    isActive: true,

    targets: [
      {
        targetType: TargetType.BRAND,
        buyQuantity: 1,
        actionType: PromotionActionType.BUY_X_GET_Y,
        discountValue: "500000.00",
        getQuantity: 1,
      },
    ],
  },
  {
    name: "APPLE_IPHONE_BUY_GET_WATCH_1TR",
    description: "Lì xì 1.000.000đ khi mua Apple Watch SE 3 / Series 11",
    priority: 20,
    isActive: true,

    targets: [
      {
        targetType: TargetType.BRAND,
        buyQuantity: 1,
        actionType: PromotionActionType.BUY_X_GET_Y,
        discountValue: "1000000.00",
        getQuantity: 1,
      },
    ],
  },
];

export async function seedPromotions(prisma: PrismaClient) {
  console.log(" 🌱 Seeding promotions...");

  const createdPromotions = [];

  for (const data of promotionData) {
    console.log(`→ Processing: ${data.name}`);

    const promotion = await prisma.promotions.upsert({
      where: { name: data.name },
      update: {
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,

        minOrderValue: data.minOrderValue ?? null,
        maxDiscountValue: data.maxDiscountValue ?? null,
        usageLimit: data.usageLimit ?? null,
      },
      create: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,

        minOrderValue: data.minOrderValue ?? null,
        maxDiscountValue: data.maxDiscountValue ?? null,
        usageLimit: data.usageLimit ?? null,
      },
    });

    // Xóa targets cũ nếu update (tránh trùng lặp khi chạy lại)
    await prisma.promotion_targets.deleteMany({
      where: { promotionId: promotion.id },
    });

    // Tạo targets mới
    for (const t of data.targets) {
      await prisma.promotion_targets.create({
        data: {
          promotionId: promotion.id,
          targetType: t.targetType,
          targetId: t.targetId ?? null,
          buyQuantity: t.buyQuantity ?? null,
          actionType: t.actionType,
          discountValue: t.discountValue ? t.discountValue : null,
          giftProductVariantId: t.giftProductVariantId ?? null,
          getQuantity: t.getQuantity ?? null,
        },
      });
    }

    createdPromotions.push(promotion);
  }

  console.log(`Seeded ${createdPromotions.length} promotions`);
  return createdPromotions;
}
