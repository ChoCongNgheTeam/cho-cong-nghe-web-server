import { PrismaClient, DiscountType, TargetType } from "@prisma/client";

type VoucherTarget =
  | { targetType: "ALL" }
  | { targetType: "BRAND"; targetIdFromBrandName: string }
  | { targetType: "CATEGORY"; targetId: string }
  | { targetType: "PRODUCT"; targetId: string };

const voucherData: {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderValue: string;
  maxDiscountValue?: string;
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  targets?: VoucherTarget[];
}[] = [
  {
    code: "WELCOME100",
    description: "Giảm 100k cho đơn đầu tiên",
    discountType: DiscountType.DISCOUNT_FIXED,
    discountValue: "100000.00",
    minOrderValue: "500000.00",
    maxDiscountValue: "100000.00",
    maxUses: 100,
    maxUsesPerUser: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    priority: 10,
    isActive: true,
    targets: [{ targetType: "ALL" }],
  },
  {
    code: "FREESHIP",
    description: "Miễn phí vận chuyển toàn quốc",
    discountType: DiscountType.DISCOUNT_FIXED,
    discountValue: "0.00",
    minOrderValue: "300000.00",
    maxDiscountValue: "0.00",
    priority: 5,
    isActive: true,
    targets: [{ targetType: "ALL" }],
  },
  {
    code: "APPLE20",
    description: "Giảm 20% cho sản phẩm Apple",
    discountType: DiscountType.DISCOUNT_PERCENT,
    discountValue: "20.00",
    minOrderValue: "10000000.00",
    maxDiscountValue: "2000000.00",
    maxUses: 50,
    maxUsesPerUser: 1,
    priority: 15,
    isActive: true,
    targets: [{ targetType: "BRAND", targetIdFromBrandName: "Apple" }],
  },
];

export async function seedVouchers(prisma: PrismaClient) {
  console.log(" 🌱 Seeding vouchers...");

  const createdVouchers = [];

  for (const data of voucherData) {
    const voucher = await prisma.vouchers.upsert({
      where: { code: data.code },
      update: {
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountValue: data.maxDiscountValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        isActive: data.isActive,
      },
      create: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountValue: data.maxDiscountValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        isActive: data.isActive,
      },
    });

    if (data.targets) {
      for (const target of data.targets) {
        let targetId: string | null = null;

        if (target.targetType === "BRAND") {
          const brand = await prisma.brands.findUnique({
            where: { name: target.targetIdFromBrandName },
          });
          if (!brand) {
            console.warn(
              `Brand "${target.targetIdFromBrandName}" not found for voucher ${data.code}`,
            );
          }
          targetId = brand?.id ?? null;
        }
        // Nếu là CATEGORY hoặc PRODUCT → giả sử targetId đã được truyền sẵn
        // (nếu bạn truyền targetId thì dùng luôn, còn không thì để null)

        if (target.targetType === "CATEGORY" || target.targetType === "PRODUCT") {
          targetId = (target as any).targetId ?? null; // type guard đơn giản
        }

        await prisma.voucher_targets.create({
          data: {
            voucherId: voucher.id,
            targetType: target.targetType as TargetType,
            targetId,
          },
        });
      }
    }

    createdVouchers.push(voucher);
  }

  console.log(`Seeded ${createdVouchers.length} vouchers`);
  return createdVouchers;
}
