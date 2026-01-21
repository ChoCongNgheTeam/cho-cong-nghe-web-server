import { PrismaClient, TargetType, PromotionActionType } from "@prisma/client";

const prisma = new PrismaClient();

/* ---------- TYPES ---------- */

type PromotionTarget = {
  targetType: TargetType;
  targetId?: string; // product variant id, category id, brand id, ...
  buyQuantity?: number; // dùng cho BUY_X_GET_Y
  actionType: PromotionActionType;
  discountValue?: string; // "150000.00" hoặc "20.00" (cho percent)
  giftProductVariantId?: string; // id của variant được tặng
  getQuantity?: number; // số lượng tặng
};

const promotionData: {
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  targets: PromotionTarget[];
}[] = [
  // 1. Giảm 200k cho đơn từ 2 triệu (toàn site)
  {
    name: "GIAM200K-THANG2",
    description: "Giảm ngay 200.000đ cho đơn hàng từ 2.000.000đ",
    priority: 20,
    isActive: true,
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-28"),
    targets: [
      {
        targetType: TargetType.ALL,
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "200000.00",
      },
    ],
  },

  //   // 2. Giảm 15% cho tất cả sản phẩm Apple
  //   {
  //     name: "APPLE15",
  //     description: "Giảm 15% toàn bộ sản phẩm Apple chính hãng",
  //     priority: 25,
  //     isActive: true,
  //     startDate: new Date(),
  //     endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 ngày tới
  //     targets: [
  //       {
  //         targetType: TargetType.BRAND,
  //         targetId: "BRAND_APPLE_ID_HERE", // ← thay bằng id thật của brand Apple
  //         actionType: PromotionActionType.DISCOUNT_PERCENT,
  //         discountValue: "15.00",
  //       },
  //     ],
  //   },

  //   // 3. Mua 2 tặng 1 (cùng sản phẩm Samsung Galaxy)
  //   {
  //     name: "MU2TANG1-SAMSUNG",
  //     description: "Mua 2 sản phẩm Samsung Galaxy được tặng 1 sản phẩm tương đương",
  //     priority: 18,
  //     isActive: true,
  //     startDate: new Date(),
  //     endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  //     targets: [
  //       {
  //         targetType: TargetType.PRODUCT,
  //         targetId: "PRODUCT_SAMSUNG_GALAXY_ID_HERE", // ← thay bằng id sản phẩm
  //         buyQuantity: 2,
  //         actionType: PromotionActionType.BUY_X_GET_Y,
  //         giftProductVariantId: "VARIANT_SAME_PRODUCT_ID_HERE", // id variant được tặng
  //         getQuantity: 1,
  //       },
  //     ],
  //   },

  //   // 4. Tặng tai nghe khi mua laptop từ 15 triệu trở lên
  //   {
  //     name: "TANG_TAI_NGHE_LAPTOP",
  //     description: "Mua laptop từ 15 triệu tặng ngay tai nghe Bluetooth trị giá 890k",
  //     priority: 15,
  //     isActive: true,
  //     startDate: new Date("2026-01-15"),
  //     endDate: new Date("2026-03-31"),
  //     targets: [
  //       {
  //         targetType: TargetType.CATEGORY,
  //         targetId: "CATEGORY_LAPTOP_ID_HERE", // ← thay bằng id category Laptop
  //         buyQuantity: 1, // mua ít nhất 1
  //         actionType: PromotionActionType.GIFT_PRODUCT,
  //         giftProductVariantId: "VARIANT_TAI_NGHE_ID_HERE", // id variant tai nghe tặng
  //         getQuantity: 1,
  //       },
  //     ],
  //   },
];

export async function seedPromotions() {
  console.log("Seeding promotions...");

  const createdPromotions = [];

  for (const data of promotionData) {
    console.log(`→ Processing: ${data.name}`);

    const promotion = await prisma.promotions.upsert({
      where: { name: data.name },
      update: {},
      create: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
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

  console.log(`🚀 Đã tạo/upsert ${createdPromotions.length} promotions`);
  return createdPromotions;
}

// Nếu bạn chạy file này độc lập (không qua prisma/seed.ts)
if (require.main === module) {
  seedPromotions()
    .catch((e) => {
      console.error("Lỗi khi seed promotions:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
