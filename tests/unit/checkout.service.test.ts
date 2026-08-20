import { describe, it, expect, vi, beforeEach } from "vitest";

const findVoucherWithUserMock = vi.fn();

vi.mock("@/app/modules/checkout/checkout.repository", () => ({
  findVoucherWithUser: (...args: any[]) => findVoucherWithUserMock(...args),
}));

vi.mock("@/config/db", () => ({
  default: {
    users: { findUnique: vi.fn() },
    payment_methods: { findUnique: vi.fn() },
  },
}));

// checkout.service.ts import getCartWithPricing ở top-level (dùng trong
// validateCartItems/prepareCheckoutData — không phải các hàm test file này
// đang test). Module đó lại kéo theo pricing.rules.ts, dùng enum
// PromotionActionType từ @prisma/client ngay lúc load module — enum này
// undefined trong Prisma stub offline của môi trường code (hạn chế môi
// trường, không phải bug thật). Mock để tránh crash import không liên quan.
vi.mock("@/app/modules/pricing/use-cases/getCartWithPricing.service", () => ({
  getCartWithPricing: vi.fn(),
}));

import { calculateShippingFee, validateAndApplyVoucher } from "@/app/modules/checkout/checkout.service";
import { BadRequestError, NotFoundError } from "@/errors";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkout.service — calculateShippingFee", () => {
  it("HCM: freeship khi đơn >= 3 triệu", () => {
    expect(calculateShippingFee(3000000, "Hồ Chí Minh")).toBe(0);
  });

  it("HCM: 30k khi đơn < 3 triệu", () => {
    expect(calculateShippingFee(500000, "Hồ Chí Minh")).toBe(30000);
  });

  it("Miền Bắc: Hà Nội nội thành 30k khi chưa đạt ngưỡng freeship", () => {
    expect(calculateShippingFee(500000, "Hà Nội")).toBe(30000);
  });

  it("tỉnh không map được vẫn có fallback an toàn (không throw, không trả 0/undefined)", () => {
    const fee = calculateShippingFee(100000, "Tỉnh Không Tồn Tại XYZ");
    expect(typeof fee).toBe("number");
    expect(fee).toBeGreaterThan(0);
  });

  it("không bao giờ trả về phí âm dù subtotal âm/bất thường", () => {
    const fee = calculateShippingFee(-500000, "Hồ Chí Minh");
    expect(fee).toBeGreaterThanOrEqual(0);
  });
});

describe("checkout.service — validateAndApplyVoucher", () => {
  it("không có voucherId -> discount = 0, không query DB", async () => {
    const result = await validateAndApplyVoucher(undefined, 500000, "user-1");
    expect(result).toEqual({ discount: 0, id: null });
    expect(findVoucherWithUserMock).not.toHaveBeenCalled();
  });

  it("báo lỗi NotFound khi voucher không tồn tại", async () => {
    findVoucherWithUserMock.mockResolvedValue(null);
    await expect(validateAndApplyVoucher("v1", 500000, "user-1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("từ chối voucher đã hết hạn (endDate đã qua)", async () => {
    findVoucherWithUserMock.mockResolvedValue({
      id: "v1",
      isActive: true,
      startDate: null,
      endDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // hôm qua
      maxUses: null,
      usesCount: 0,
      minOrderValue: 0,
      maxUsesPerUser: null,
      voucherUsers: [],
      discountType: "DISCOUNT_FIXED",
      discountValue: 50000,
    });
    await expect(validateAndApplyVoucher("v1", 500000, "user-1")).rejects.toBeInstanceOf(BadRequestError);
  });

  it("từ chối khi đơn chưa đạt giá trị tối thiểu", async () => {
    findVoucherWithUserMock.mockResolvedValue({
      id: "v1",
      isActive: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usesCount: 0,
      minOrderValue: 1000000,
      maxUsesPerUser: null,
      voucherUsers: [],
      discountType: "DISCOUNT_FIXED",
      discountValue: 50000,
    });
    await expect(validateAndApplyVoucher("v1", 500000, "user-1")).rejects.toBeInstanceOf(BadRequestError);
  });

  it("từ chối khi user đã dùng hết lượt cho phép của riêng họ", async () => {
    findVoucherWithUserMock.mockResolvedValue({
      id: "v1",
      isActive: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usesCount: 0,
      minOrderValue: 0,
      maxUsesPerUser: 1,
      voucherUsers: [{ usedCount: 1 }],
      discountType: "DISCOUNT_FIXED",
      discountValue: 50000,
    });
    await expect(validateAndApplyVoucher("v1", 500000, "user-1")).rejects.toBeInstanceOf(BadRequestError);
  });

  it("giảm giá % bị chặn bởi maxDiscountValue — không bao giờ giảm vượt trần", async () => {
    findVoucherWithUserMock.mockResolvedValue({
      id: "v1",
      isActive: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usesCount: 0,
      minOrderValue: 0,
      maxUsesPerUser: null,
      voucherUsers: [],
      discountType: "DISCOUNT_PERCENT",
      discountValue: 50, // 50%
      maxDiscountValue: 100000, // trần 100k
    });

    // 50% của 1 triệu = 500k, nhưng phải bị chặn ở trần 100k
    const result = await validateAndApplyVoucher("v1", 1000000, "user-1");
    expect(result.discount).toBe(100000);
  });

  it("discount KHÔNG BAO GIỜ vượt quá subtotal (kể cả fixed-amount voucher lớn hơn đơn hàng)", async () => {
    findVoucherWithUserMock.mockResolvedValue({
      id: "v1",
      isActive: true,
      startDate: null,
      endDate: null,
      maxUses: null,
      usesCount: 0,
      minOrderValue: 0,
      maxUsesPerUser: null,
      voucherUsers: [],
      discountType: "DISCOUNT_FIXED",
      discountValue: 9999999, // voucher giảm cố định rất lớn
    });

    // subtotal chỉ 50k -> discount phải clamp về đúng 50k, không được âm tổng đơn
    const result = await validateAndApplyVoucher("v1", 50000, "user-1");
    expect(result.discount).toBe(50000);
  });

  it("áp dụng thành công voucher hợp lệ, trả đúng discount và id", async () => {
    findVoucherWithUserMock.mockResolvedValue({
      id: "v1",
      isActive: true,
      startDate: null,
      endDate: null,
      maxUses: 100,
      usesCount: 5,
      minOrderValue: 100000,
      maxUsesPerUser: 3,
      voucherUsers: [{ usedCount: 1 }],
      discountType: "DISCOUNT_FIXED",
      discountValue: 30000,
    });

    const result = await validateAndApplyVoucher("v1", 500000, "user-1");
    expect(result).toEqual({ discount: 30000, id: "v1" });
  });
});
