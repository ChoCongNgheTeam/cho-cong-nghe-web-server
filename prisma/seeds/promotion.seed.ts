import { PrismaClient, TargetType, PromotionActionType } from "@prisma/client";

type PromotionRuleSeed = {
  actionType: PromotionActionType;
  discountValue?: string;
  buyQuantity?: number;
  getQuantity?: number;
  giftProductVariantId?: string | null;
};

type PromotionTargetSeed = {
  targetType: TargetType;
  targetCode?: string;
  targetValue?: string;
  targetId?: string | null;
};

const promotionTemplates: {
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
  notes?: string;
}[] = [
  // ============================================================================
  // 🌍 GLOBAL
  // ============================================================================

  {
    name: "GLOBAL_5_PERCENT",
    description: "Giảm 5% toàn bộ sản phẩm",
    priority: 5,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "5.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ALL,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // 🍎 BRAND
  // ============================================================================

  {
    name: "APPLE_7_PERCENT",
    description: "Giảm 7% cho toàn bộ sản phẩm Apple",
    priority: 10,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "7.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: "apple",
      },
    ],
  },

  // ============================================================================
  // 📱 CATEGORY
  // ============================================================================

  {
    name: "IPHONE_10_PERCENT",
    description: "Giảm 10% cho toàn bộ iPhone",
    priority: 20,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: "iphone",
      },
    ],
  },

  // ============================================================================
  // 💾 ATTRIBUTE (storage)
  // ============================================================================

  {
    name: "STORAGE_128GB_8_PERCENT",
    description: "Giảm 8% cho bản 128GB",
    priority: 30,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "8.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ATTRIBUTE,
        targetCode: "storage",
        targetValue: "128GB",
      },
    ],
  },

  {
    name: "STORAGE_256GB_5_PERCENT",
    description: "Giảm 5% cho bản 256GB",
    priority: 30,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "5.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ATTRIBUTE,
        targetCode: "storage",
        targetValue: "256GB",
      },
    ],
  },

  {
    name: "STORAGE_512GB_12_PERCENT",
    description: "Giảm 12% cho bản 512GB",
    priority: 30,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ATTRIBUTE,
        targetCode: "storage",
        targetValue: "512GB",
      },
    ],
  },

  // ============================================================================
  // 🎯 PRODUCT (override riêng)
  // ============================================================================

  {
    name: "IPHONE_16_SPECIAL_20_PERCENT",
    description: "Giảm riêng 20% cho iPhone 16",
    priority: 100,
    isActive: true,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.PRODUCT,
        targetId: "iphone-16",
      },
    ],
  },

  // ============================================================================
  // ⚡ FLASH SALE
  // ============================================================================

  {
    name: "FLASH_SALE_15_PERCENT",
    description: "Flash Sale giảm 15% toàn bộ sản phẩm",
    priority: 50,
    isActive: true,
    startDate: new Date("2026-03-18T00:00:00.000Z"),
    endDate: new Date("2026-03-18T23:59:59.000Z"),
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ALL,
        targetId: null,
      },
    ],
  },
];

/**
 * SEED FUNCTION
 */
export async function seedPromotions(prisma: PrismaClient) {
  console.log("🌱 Seeding promotion templates...");
  console.log(`📋 Total templates: ${promotionTemplates.length}`);

  const createdPromotions = [];

  for (const data of promotionTemplates) {
    console.log(`→ Processing: ${data.name}`);
    if (data.notes) {
      console.log(`  ℹ️  ${data.notes}`);
    }

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

    await prisma.promotion_rules.deleteMany({ where: { promotionId: promotion.id } });
    await prisma.promotion_targets.deleteMany({ where: { promotionId: promotion.id } });

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

  console.log(`✅ Seeded ${createdPromotions.length} promotion templates`);
  console.log("");
  console.log("📝 SAU KHI SEED — TEST APIs:");
  console.log("  GET /products/sale-schedule-v2?startDate=2026-03-18&endDate=2026-03-20");
  console.log("  GET /products/sale-by-date?date=2026-03-18");
  console.log("  GET /products/sale-by-date?date=2026-03-19");
  console.log("  GET /products/sale-by-date?date=2026-03-20");
  console.log("");
  console.log("📝 UPDATE targetId sau khi seed:");
  console.log("  FLASH_SALE_18_03 → targetType ALL, không cần update targetId");
  console.log("  SALE_LAPTOP_19_03 → UPDATE promotion_targets SET targetId = '<laptop_category_id>'");
  console.log("  WEEKEND_SALE_20_03 → UPDATE promotion_targets SET targetId = '<phukien_category_id>'");

  return createdPromotions;
}
