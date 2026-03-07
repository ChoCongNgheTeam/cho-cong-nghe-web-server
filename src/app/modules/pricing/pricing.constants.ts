export const PRICING_RULES = {
  // Quy tắc áp dụng
  MAX_PROMOTIONS_PER_PRODUCT: 1, // Mỗi sản phẩm chỉ được 1 promotion

  // Thứ tự tính toán
  CALCULATION_ORDER: {
    STEP_1: "PROMOTION", // Áp dụng promotion trước
    STEP_2: "VOUCHER", // Voucher áp dụng sau promotion
  },

  // Voucher rules
  VOUCHER_APPLIES_TO: "CART_TOTAL", // Voucher áp cho tổng giỏ hàng (sau promotion)
} as const;

export const DISCOUNT_CALCULATION = {
  DISCOUNT_PERCENT: (basePrice: number, value: number, maxDiscount?: number) => {
    const discount = Math.round(basePrice * (value / 100));
    return maxDiscount ? Math.min(discount, maxDiscount) : discount;
  },

  DISCOUNT_FIXED: (basePrice: number, value: number) => {
    return Math.min(value, basePrice); // Không được vượt quá giá gốc
  },
} as const;
