import { Prisma } from "@prisma/client";

// Select đầy đủ cho admin — thấy hết voucher liên kết, ngân sách, số đã trao
export const spinPrizeSelectAdmin = {
  id: true,
  label: true,
  colorHex: true,
  voucherId: true,
  weight: true,
  totalBudget: true,
  awardedCount: true,
  order: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  voucher: { select: { id: true, code: true, discountType: true, discountValue: true } },
} satisfies Prisma.spin_prizesSelect;

export type SpinPrizeAdminRow = Prisma.spin_prizesGetPayload<{ select: typeof spinPrizeSelectAdmin }>;

// Select rút gọn cho public — KHÔNG lộ voucherId/weight/totalBudget (tránh lộ tỉ lệ trúng thật)
export interface SpinPrizePublic {
  id: string;
  label: string;
  colorHex: string | null;
  order: number;
}

export interface SpinStatusResponse {
  canSpin: boolean;
  prizes: SpinPrizePublic[];
  wonPrize: { label: string; voucherCode: string | null } | null;
}

export interface SpinResultResponse {
  prizeId: string;
  label: string;
  voucherCode: string | null;
}
