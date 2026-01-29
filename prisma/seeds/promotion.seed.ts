import { PrismaClient, TargetType, PromotionActionType } from "@prisma/client";

type PromotionRuleSeed = {
  actionType: PromotionActionType;
  discountValue?: string;
  buyQuantity?: number;
  getQuantity?: number;
  giftProductVariantId?: string;
};

type PromotionTargetSeed = {
  targetType: TargetType;
  targetId?: string;
};

const promotionData: {
  name: string;
  description: string;
  priority: number;
  isActive: boolean;

  startDate?: Date;
  endDate?: Date;

  minOrderValue?: string;
  maxDiscountValue?: string;
  usageLimit?: number;

  rules: PromotionRuleSeed[];
  targets: PromotionTargetSeed[];
}[] = [
  {
    name: "APPLE_IPHONE_GIAM_400K",
    description: "Giảm ngay 400.000đ cho sản phẩm Apple iPhone",
    priority: 30,
    isActive: true,

    startDate: new Date("2026-01-27"),
    endDate: new Date("2026-02-28"),

    minOrderValue: undefined,
    maxDiscountValue: undefined,
    usageLimit: undefined,

    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "400000.00",
      },
    ],

    targets: [
      {
        targetType: TargetType.PRODUCT,
        // targetId: productVariantId
      },
    ],
  },
];

export async function seedPromotions(prisma: PrismaClient) {
  console.log("🌱 Seeding promotions...");

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

    // Reset Rules + Targets (Idempotent seed)
    await prisma.promotion_rules.deleteMany({
      where: { promotionId: promotion.id },
    });

    await prisma.promotion_targets.deleteMany({
      where: { promotionId: promotion.id },
    });

    // Create Rules
    for (const r of data.rules) {
      await prisma.promotion_rules.create({
        data: {
          promotionId: promotion.id,
          actionType: r.actionType,
          discountValue: r.discountValue ?? null,
          buyQuantity: r.buyQuantity ?? null,
          getQuantity: r.getQuantity ?? null,
          giftProductVariantId: r.giftProductVariantId ?? null,
        },
      });
    }

    // Create Targets
    for (const t of data.targets) {
      await prisma.promotion_targets.create({
        data: {
          promotionId: promotion.id,
          targetType: t.targetType,
          targetId: t.targetId ?? null,
        },
      });
    }

    createdPromotions.push(promotion);
  }

  console.log(`✅ Seeded ${createdPromotions.length} promotions`);
  return createdPromotions;
}
