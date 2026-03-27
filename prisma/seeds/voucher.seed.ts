import { PrismaClient, DiscountType, TargetType } from "@prisma/client";

type VoucherSeedTarget = { targetType: "ALL" } | { targetType: "BRAND"; brandName: string } | { targetType: "CATEGORY"; categorySlug: string } | { targetType: "PRODUCT"; productSlug: string };

interface VoucherSeedItem {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderValue: string;
  maxDiscountValue?: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  targets: VoucherSeedTarget[];
}

// Helpers
const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const voucherSeeds: VoucherSeedItem[] = [
  // ── 1. WELCOME — cá nhân, tạo qua register, không seed ──
  // (được tạo động trong auth.service.ts)

  // ── 2. PUBLIC GENERAL ─────────────────────────────────────
  {
    code: "SALE100K",
    description: "Giảm 100k cho đơn từ 1 triệu",
    discountType: DiscountType.DISCOUNT_FIXED,
    discountValue: "100000",
    minOrderValue: "1000000",
    maxDiscountValue: "100000",
    maxUses: 200,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(14),
    priority: 10,
    isActive: true,
    targets: [{ targetType: "ALL" }],
  },
  {
    code: "GIAM5",
    description: "Giảm 5% toàn bộ đơn hàng (tối đa 200k)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "5",
    minOrderValue: "500000",
    maxDiscountValue: "200000",
    maxUses: 500,
    maxUsesPerUser: 2,
    startDate: new Date(),
    endDate: days(30),
    priority: 5,
    isActive: true,
    targets: [{ targetType: "ALL" }],
  },
  {
    code: "GIAM10",
    description: "Giảm 10% cho đơn từ 5 triệu (tối đa 500k)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "10",
    minOrderValue: "5000000",
    maxDiscountValue: "500000",
    maxUses: 300,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(21),
    priority: 8,
    isActive: true,
    targets: [{ targetType: "ALL" }],
  },

  // ── 3. BRAND-SPECIFIC ─────────────────────────────────────
  {
    code: "APPLE15",
    description: "Giảm 15% sản phẩm Apple (tối đa 3 triệu)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "15",
    minOrderValue: "10000000",
    maxDiscountValue: "3000000",
    maxUses: 100,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(7),
    priority: 15,
    isActive: true,
    targets: [{ targetType: "BRAND", brandName: "Apple" }],
  },
  {
    code: "SAMSUNG10",
    description: "Giảm 10% sản phẩm Samsung (tối đa 1.5 triệu)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "10",
    minOrderValue: "8000000",
    maxDiscountValue: "1500000",
    maxUses: 150,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(10),
    priority: 12,
    isActive: true,
    targets: [{ targetType: "BRAND", brandName: "Samsung" }],
  },
  {
    code: "XIAOMI200K",
    description: "Giảm 200k cho điện thoại Xiaomi",
    discountType: DiscountType.DISCOUNT_FIXED,
    discountValue: "200000",
    minOrderValue: "3000000",
    maxDiscountValue: "200000",
    maxUses: 200,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(14),
    priority: 10,
    isActive: true,
    targets: [{ targetType: "BRAND", brandName: "Xiaomi" }],
  },

  // ── 4. CATEGORY-SPECIFIC ──────────────────────────────────
  {
    code: "LAPTOP500K",
    description: "Giảm 500k khi mua Laptop",
    discountType: DiscountType.DISCOUNT_FIXED,
    discountValue: "500000",
    minOrderValue: "15000000",
    maxDiscountValue: "500000",
    maxUses: 100,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(30),
    priority: 20,
    isActive: true,
    targets: [{ targetType: "CATEGORY", categorySlug: "laptop" }],
  },
  {
    code: "PHONE8",
    description: "Giảm 8% điện thoại (tối đa 1.2 triệu)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "8",
    minOrderValue: "5000000",
    maxDiscountValue: "1200000",
    maxUses: 300,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: days(14),
    priority: 12,
    isActive: true,
    targets: [{ targetType: "CATEGORY", categorySlug: "dien-thoai" }],
  },

  // ── 5. CAMPAIGN / EVENT ────────────────────────────────────
  {
    code: "BLACKFRIDAY",
    description: "Black Friday — Giảm 20% toàn bộ (tối đa 2 triệu)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "20",
    minOrderValue: "3000000",
    maxDiscountValue: "2000000",
    maxUses: 1000,
    maxUsesPerUser: 1,
    startDate: days(60), // chưa mở — sắp tới
    endDate: days(61),
    priority: 30,
    isActive: false, // admin bật khi cần
    targets: [{ targetType: "ALL" }],
  },
  {
    code: "SALE99",
    description: "Sale 9/9 — Giảm 9% (tối đa 900k)",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "9",
    minOrderValue: "2000000",
    maxDiscountValue: "900000",
    maxUses: 999,
    maxUsesPerUser: 1,
    startDate: days(45),
    endDate: days(46),
    priority: 25,
    isActive: false,
    targets: [{ targetType: "ALL" }],
  },

  // ── 6. FREESHIP ────────────────────────────────────────────
  {
    code: "FREESHIP50K",
    description: "Miễn phí vận chuyển (tương đương giảm 50k)",
    discountType: DiscountType.DISCOUNT_FIXED,
    discountValue: "50000",
    minOrderValue: "300000",
    maxDiscountValue: "50000",
    // maxUses: null, // không giới hạn
    maxUsesPerUser: 3,
    startDate: new Date(),
    endDate: days(60),
    priority: 3,
    isActive: true,
    targets: [{ targetType: "ALL" }],
  },
];

export async function seedVouchers(prisma: PrismaClient) {
  console.log("🌱 Seeding vouchers...");

  let created = 0;
  let skipped = 0;

  for (const seed of voucherSeeds) {
    try {
      // Upsert voucher
      const voucher = await prisma.vouchers.upsert({
        where: { code: seed.code },
        update: {
          description: seed.description,
          discountType: seed.discountType,
          discountValue: seed.discountValue,
          minOrderValue: seed.minOrderValue,
          maxDiscountValue: seed.maxDiscountValue ?? null,
          maxUses: seed.maxUses ?? null,
          maxUsesPerUser: seed.maxUsesPerUser ?? null,
          startDate: seed.startDate ?? null,
          endDate: seed.endDate ?? null,
          priority: seed.priority,
          isActive: seed.isActive,
        },
        create: {
          code: seed.code,
          description: seed.description,
          discountType: seed.discountType,
          discountValue: seed.discountValue,
          minOrderValue: seed.minOrderValue,
          maxDiscountValue: seed.maxDiscountValue ?? null,
          maxUses: seed.maxUses ?? null,
          maxUsesPerUser: seed.maxUsesPerUser ?? null,
          startDate: seed.startDate ?? null,
          endDate: seed.endDate ?? null,
          priority: seed.priority,
          isActive: seed.isActive,
        },
      });

      // Xóa targets cũ rồi tạo lại
      await prisma.voucher_targets.deleteMany({ where: { voucherId: voucher.id } });

      for (const target of seed.targets) {
        let targetId: string | null = null;

        if (target.targetType === "BRAND") {
          const brand = await prisma.brands.findUnique({
            where: { name: target.brandName },
            select: { id: true },
          });
          if (!brand) {
            console.warn(`  ⚠ Brand "${target.brandName}" not found — skipping target`);
            continue;
          }
          targetId = brand.id;
        }

        if (target.targetType === "CATEGORY") {
          const category = await prisma.categories.findFirst({
            where: { slug: target.categorySlug, deletedAt: null },
            select: { id: true },
          });
          if (!category) {
            console.warn(`  ⚠ Category slug "${target.categorySlug}" not found — skipping target`);
            continue;
          }
          targetId = category.id;
        }

        if (target.targetType === "PRODUCT") {
          const product = await prisma.products.findFirst({
            where: { slug: target.productSlug, deletedAt: null },
            select: { id: true },
          });
          if (!product) {
            console.warn(`  ⚠ Product slug "${target.productSlug}" not found — skipping target`);
            continue;
          }
          targetId = product.id;
        }

        await prisma.voucher_targets.create({
          data: {
            voucherId: voucher.id,
            targetType: target.targetType as TargetType,
            targetId,
          },
        });
      }

      created++;
      console.log(`  ✓ ${seed.code}`);
    } catch (err: any) {
      console.error(`  ✗ ${seed.code}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`✅ Vouchers: ${created} seeded, ${skipped} failed`);
}
