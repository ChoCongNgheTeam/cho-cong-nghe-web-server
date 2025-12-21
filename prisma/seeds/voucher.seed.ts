import { PrismaClient, DiscountType, VoucherActionType } from "@prisma/client";

const prisma = new PrismaClient();

/* ---------- TYPES ---------- */

type VoucherTarget =
  | { targetType: "ALL" }
  | { targetType: "BRAND"; targetIdFromBrandName: string }
  | { targetType: "CATEGORY"; targetId: string }
  | { targetType: "PRODUCT"; targetId: string };

type VoucherAction =
  | { actionType: "FREE_SHIPPING" }
  | { actionType: "DISCOUNT"; value: string }
  | {
      actionType: "BUY_X_GET_Y";
      buyQuantity: number;
      getQuantity: number;
    };

const voucherData: {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderValue: string;
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  targets?: VoucherTarget[];
  actions?: VoucherAction[];
}[] = [
  {
    code: "WELCOME100",
    description: "Giảm 100k cho đơn đầu tiên",
    discountType: "FIXED",
    discountValue: "100000.00",
    minOrderValue: "500000.00",
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
    discountType: "FIXED",
    discountValue: "0.00",
    minOrderValue: "300000.00",
    priority: 5,
    isActive: true,
    actions: [{ actionType: "FREE_SHIPPING" }],
    targets: [{ targetType: "ALL" }],
  },
  {
    code: "APPLE20",
    description: "Giảm 20% cho sản phẩm Apple",
    discountType: "PERCENTAGE",
    discountValue: "20.00",
    minOrderValue: "10000000.00",
    maxUses: 50,
    maxUsesPerUser: 1,
    priority: 15,
    isActive: true,
    actions: [{ actionType: "BUY_X_GET_Y", buyQuantity: 2, getQuantity: 1 }],
    targets: [{ targetType: "BRAND", targetIdFromBrandName: "Apple" }],
  },
];

export async function seedVouchers() {
  console.log("Seeding vouchers...");

  const createdVouchers = [];

  for (const data of voucherData) {
    const voucher = await prisma.vouchers.upsert({
      where: { code: data.code },
      update: {},
      create: {
        code: data.code,
        description: data.description,
        discountType: data.discountType as "PERCENTAGE" | "FIXED",
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        isActive: data.isActive,
      },
    });

    // Tạo targets
    if (data.targets) {
      for (const target of data.targets) {
        let targetId: string | null = null;

        if (target.targetType === "BRAND") {
          const brand = await prisma.brands.findUnique({
            where: { name: target.targetIdFromBrandName },
          });
          targetId = brand?.id ?? null;
        }

        if (target.targetType === "CATEGORY" || target.targetType === "PRODUCT") {
          targetId = target.targetId;
        }

        await prisma.voucher_targets.create({
          data: {
            voucherId: voucher.id,
            targetType: target.targetType,
            targetId,
          },
        });
      }
    }

    // Tạo actions
    if (data.actions) {
      for (const action of data.actions) {
        await prisma.voucher_actions.create({
          data: {
            voucherId: voucher.id,
            actionType: action.actionType as VoucherActionType,
            value: action.actionType === "DISCOUNT" ? action.value : null,
            buyQuantity: action.actionType === "BUY_X_GET_Y" ? action.buyQuantity : null,
            getQuantity: action.actionType === "BUY_X_GET_Y" ? action.getQuantity : null,
          },
        });
      }
    }

    createdVouchers.push(voucher);
  }

  console.log(`🚶‍➡️    Đã tạo ${createdVouchers.length} vouchers`);
  return createdVouchers;
}
