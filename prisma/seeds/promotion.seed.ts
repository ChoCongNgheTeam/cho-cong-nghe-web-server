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

/**
 * HƯỚNG DẪN SỬ DỤNG:
 *
 * 1. Seed data này tạo sẵn các promotion templates
 * 2. targetId để NULL - khi cần áp dụng, bạn vào DB update targetId
 * 3. Sau khi reset DB, chạy seed này để tạo lại templates
 * 4. Lấy ID từ categories/brands/products và update vào promotion_targets table
 *
 * VÍ DỤ UPDATE:
 * UPDATE promotion_targets
 * SET targetId = 'category-id-thuc-te'
 * WHERE promotionId = (SELECT id FROM promotions WHERE name = 'IPHONE_GIAM_10_PERCENT');
 */

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
  notes?: string; // Ghi chú cho dev
}[] = [
  // ============================================================================
  // ĐIỆN THOẠI - BRAND PROMOTIONS
  // ============================================================================
  {
    name: "APPLE_IPHONE_GIAM_10_PERCENT",
    description: "Giảm 10% cho tất cả iPhone",
    priority: 20,
    isActive: true, // Mặc định tắt, bật khi cần
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
        targetId: null, // Update brand ID sau
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

    // Create Targets (với targetId = null)
    for (const t of data.targets) {
      await prisma.promotion_targets.create({
        data: {
          promotionId: promotion.id,
          targetType: t.targetType,
          targetId: t.targetId ?? null, // NULL - sẽ update sau
        },
      });
    }

    createdPromotions.push(promotion);
  }

  console.log(`✅ Seeded ${createdPromotions.length} promotion templates`);
  console.log("");
  console.log("📝 HƯỚNG DẪN SỬ DỤNG:");
  console.log("1. Tất cả promotion templates đã được tạo với targetId = NULL");
  console.log("2. Để kích hoạt promotion, bạn cần:");
  console.log("   - Lấy ID của category/brand/product từ DB");
  console.log("   - UPDATE promotion_targets SET targetId = 'ID-thuc-te' WHERE ...");
  console.log("   - UPDATE promotions SET isActive = true WHERE name = '...'");
  console.log("");
  console.log("VÍ DỤ UPDATE:");
  console.log("UPDATE promotion_targets");
  console.log("SET targetId = 'cat_iphone_17_series_id'");
  console.log("WHERE promotionId = (");
  console.log("  SELECT id FROM promotions");
  console.log("  WHERE name = 'IPHONE_17_SERIES_GIAM_2_TRIEU'");
  console.log(");");
  console.log("");

  return createdPromotions;
}
