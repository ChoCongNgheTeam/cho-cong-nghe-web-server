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
  targetId: string | null;
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
  // EXISTING
  // ============================================================================
  {
    name: "APPLE_IPHONE_GIAM_10_PERCENT",
    description: "Giảm 10% cho tất cả iPhone",
    priority: 20,
    isActive: true,
    startDate: new Date("2026-03-05"),
    endDate: new Date("2026-04-28"),
    notes: "Apply cho brand: Apple (iPhone) - Lấy brand ID và update vào targetId",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // TEST: 3 PROMOTIONS CHO NGÀY 18 / 19 / 20 THÁNG 3
  // (dùng để test GET /sale-schedule-v2 và GET /sale-by-date)
  // Sau khi seed xong → update targetId bằng ID thực tế trong DB
  // ============================================================================

  {
    name: "FLASH_SALE_18_03_2026",
    description: "Flash Sale 18/03 — Giảm 15% toàn bộ sản phẩm",
    priority: 30,
    isActive: true,
    startDate: new Date("2026-03-18T00:00:00.000Z"),
    endDate: new Date("2026-03-18T23:59:59.000Z"),
    notes: "Test ngày 18/03. Đổi targetType ALL → áp dụng toàn sản phẩm, không cần targetId",
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

  {
    name: "SALE_LAPTOP_19_03_2026",
    description: "Ưu đãi Laptop 19/03 — Giảm 2.000.000đ",
    priority: 25,
    isActive: true,
    startDate: new Date("2026-03-19T00:00:00.000Z"),
    endDate: new Date("2026-03-19T23:59:59.000Z"),
    notes: "Test ngày 19/03. Update targetId = ID của category Laptop",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // → update = category Laptop ID
      },
    ],
  },

  {
    name: "WEEKEND_SALE_20_03_2026",
    description: "Weekend Sale 20/03 — Mua 1 tặng 1 phụ kiện",
    priority: 20,
    isActive: true,
    startDate: new Date("2026-03-20T00:00:00.000Z"),
    endDate: new Date("2026-03-20T23:59:59.000Z"),
    notes: "Test ngày 20/03. Update targetId = ID của category Phụ kiện",
    rules: [
      {
        actionType: PromotionActionType.BUY_X_GET_Y,
        buyQuantity: 1,
        getQuantity: 1,
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // → update = category Phụ kiện ID
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
