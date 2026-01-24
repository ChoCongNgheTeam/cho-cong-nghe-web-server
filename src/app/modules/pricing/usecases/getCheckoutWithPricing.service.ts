import { calculateCartPrice } from "../pricing.service";
import { PricingProductInput } from "../pricing.types";

/**
 * Checkout Item Input (từ cart hoặc buy now)
 */
export interface CheckoutItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  basePrice: number;

  // Context for pricing
  brandId?: string;
  categoryPath?: string[];

  // Product info for display
  productName: string;
  productSlug: string;
  variantImage?: string;
  variantAttributes?: {
    attributeName: string;
    optionValue: string;
  }[];
}

/**
 * Shipping Method
 */
export interface ShippingMethod {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
}

/**
 * Payment Method
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";
  description?: string;
}

/**
 * Checkout Summary Response
 */
export interface CheckoutWithPricingResponse {
  // Items
  items: {
    productId: string;
    variantId: string;
    productName: string;
    productSlug: string;
    variantImage?: string;
    variantAttributes?: {
      attributeName: string;
      optionValue: string;
    }[];
    quantity: number;

    // Pricing
    basePrice: number;
    finalPrice: number;
    totalBasePrice: number;
    totalFinalPrice: number;
    totalDiscount: number;

    // Promotions applied
    promotions: {
      id: string;
      name: string;
      description: string;
      discountAmount: number;
    }[];
  }[];

  // Gifts
  gifts: {
    variantId: string;
    quantity: number;
    productName?: string;
    productImage?: string;
  }[];

  // Pricing Summary
  pricing: {
    subtotal: number;
    promotionDiscount: number;
    voucherDiscount: number;
    totalDiscount: number;
    shippingFee: number;
    finalTotal: number;
  };

  // Applied voucher
  appliedVoucher?: {
    id: string;
    code: string;
    discountAmount: number;
    description: string;
  };

  // Validation
  isValid: boolean;
  errors: string[];
}

/**
 * ===== MAIN USECASE =====
 * Get checkout summary with pricing
 * Dùng cho: Checkout page
 */
export const getCheckoutWithPricing = async (
  checkoutItems: CheckoutItemInput[],
  shippingFee: number = 0,
  userId?: string,
  voucherCode?: string,
): Promise<CheckoutWithPricingResponse> => {
  // Convert to pricing input
  const pricingInput: PricingProductInput[] = checkoutItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    basePrice: item.basePrice,
    quantity: item.quantity,
    brandId: item.brandId,
    categoryPath: item.categoryPath,
  }));

  // Calculate pricing (CART MODE)
  const pricingResult = await calculateCartPrice({
    items: pricingInput,
    userId,
    voucherCode,
  });

  // Map items
  const items = pricingResult.items.map((pricedItem, index) => {
    const originalItem = checkoutItems[index];

    return {
      productId: pricedItem.productId,
      variantId: pricedItem.variantId,
      productName: originalItem.productName,
      productSlug: originalItem.productSlug,
      variantImage: originalItem.variantImage,
      variantAttributes: originalItem.variantAttributes,
      quantity: pricedItem.quantity,

      basePrice: pricedItem.basePrice,
      finalPrice: pricedItem.finalPrice,
      totalBasePrice: pricedItem.totalBasePrice,
      totalFinalPrice: pricedItem.totalFinalPrice,
      totalDiscount: pricedItem.totalDiscount,

      promotions: pricedItem.appliedPromotions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        discountAmount: p.discountAmount,
      })),
    };
  });

  // Calculate final total with shipping
  const finalTotal = pricingResult.finalTotal + shippingFee;

  return {
    items,
    gifts: pricingResult.totalGifts,
    pricing: {
      subtotal: pricingResult.subtotal,
      promotionDiscount: pricingResult.totalPromotionDiscount,
      voucherDiscount: pricingResult.totalVoucherDiscount,
      totalDiscount: pricingResult.totalDiscount,
      shippingFee,
      finalTotal,
    },
    appliedVoucher: pricingResult.appliedVoucher
      ? {
          id: pricingResult.appliedVoucher.id,
          code: pricingResult.appliedVoucher.name,
          discountAmount: pricingResult.appliedVoucher.discountAmount,
          description: pricingResult.appliedVoucher.description,
        }
      : undefined,
    isValid: pricingResult.isValid,
    errors: pricingResult.errors,
  };
};

/**
 * ===== HELPER USECASE =====
 * Validate checkout before creating order
 */
export const validateCheckoutBeforeOrder = async (
  checkoutItems: CheckoutItemInput[],
  shippingFee: number,
  userId?: string,
  voucherCode?: string,
): Promise<{
  isValid: boolean;
  errors: string[];
  checkout?: CheckoutWithPricingResponse;
}> => {
  const errors: string[] = [];

  // Basic validation
  if (checkoutItems.length === 0) {
    errors.push("Không có sản phẩm nào để thanh toán");
    return { isValid: false, errors };
  }

  if (shippingFee < 0) {
    errors.push("Phí vận chuyển không hợp lệ");
    return { isValid: false, errors };
  }

  // Get checkout with pricing
  const checkout = await getCheckoutWithPricing(checkoutItems, shippingFee, userId, voucherCode);

  // Check pricing validity
  if (!checkout.isValid) {
    errors.push(...checkout.errors);
  }

  // Check final total
  if (checkout.pricing.finalTotal <= 0) {
    errors.push("Tổng giá trị đơn hàng không hợp lệ");
  }

  return {
    isValid: errors.length === 0,
    errors,
    checkout: errors.length === 0 ? checkout : undefined,
  };
};

/**
 * ===== HELPER USECASE =====
 * Calculate shipping fee (giả lập - thực tế gọi API ship)
 */
export const calculateShippingFee = async (
  checkoutItems: CheckoutItemInput[],
  shippingAddress: {
    provinceId: string;
    districtId: string;
    wardId: string;
  },
  shippingMethodId?: string,
): Promise<{
  fee: number;
  estimatedDays: string;
  availableMethods?: ShippingMethod[];
}> => {
  // TODO: Tích hợp API ship thực tế (GHN, GHTK, Viettel Post...)
  // Hiện tại mock data

  const totalWeight = checkoutItems.reduce((sum, item) => sum + item.quantity * 200, 0); // Giả sử 200g/sp

  // Mock shipping methods
  const availableMethods: ShippingMethod[] = [
    {
      id: "standard",
      name: "Giao hàng tiêu chuẩn",
      fee: 30000,
      estimatedDays: "3-5 ngày",
    },
    {
      id: "express",
      name: "Giao hàng nhanh",
      fee: 50000,
      estimatedDays: "1-2 ngày",
    },
  ];

  const selectedMethod =
    availableMethods.find((m) => m.id === shippingMethodId) || availableMethods[0];

  return {
    fee: selectedMethod.fee,
    estimatedDays: selectedMethod.estimatedDays,
    availableMethods,
  };
};

/**
 * ===== HELPER USECASE =====
 * Preview order before creation
 */
export const previewOrder = async (
  checkoutItems: CheckoutItemInput[],
  shippingAddress: {
    provinceId: string;
    districtId: string;
    wardId: string;
  },
  userId?: string,
  voucherCode?: string,
  shippingMethodId?: string,
): Promise<{
  checkout: CheckoutWithPricingResponse;
  shipping: {
    fee: number;
    estimatedDays: string;
    availableMethods: ShippingMethod[];
  };
  paymentMethods: PaymentMethod[];
}> => {
  // Calculate shipping
  const shipping = await calculateShippingFee(checkoutItems, shippingAddress, shippingMethodId);

  // Get checkout with pricing
  const checkout = await getCheckoutWithPricing(checkoutItems, shipping.fee, userId, voucherCode);

  // Available payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng (COD)",
      type: "COD",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      type: "BANK_TRANSFER",
      description: "Chuyển khoản qua ngân hàng",
    },
    {
      id: "vnpay",
      name: "VNPay",
      type: "VNPAY",
      description: "Thanh toán qua VNPay",
    },
  ];

  return {
    checkout,
    shipping: {
      fee: shipping.fee,
      estimatedDays: shipping.estimatedDays,
      availableMethods: shipping.availableMethods || [],
    },
    paymentMethods,
  };
};

/**
 * ===== HELPER USECASE =====
 * Create order data structure (ready for DB insert)
 */
export const prepareOrderData = async (
  checkoutItems: CheckoutItemInput[],
  checkout: CheckoutWithPricingResponse,
  orderInfo: {
    userId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: {
      address: string;
      wardId: string;
      districtId: string;
      provinceId: string;
    };
    paymentMethodId: string;
    notes?: string;
  },
) => {
  return {
    // Order header
    userId: orderInfo.userId,
    customerName: orderInfo.customerName,
    customerPhone: orderInfo.customerPhone,
    customerEmail: orderInfo.customerEmail,
    shippingAddress: orderInfo.shippingAddress.address,
    wardId: orderInfo.shippingAddress.wardId,
    districtId: orderInfo.shippingAddress.districtId,
    provinceId: orderInfo.shippingAddress.provinceId,
    paymentMethodId: orderInfo.paymentMethodId,
    notes: orderInfo.notes,

    // Pricing
    subtotal: checkout.pricing.subtotal,
    promotionDiscount: checkout.pricing.promotionDiscount,
    voucherDiscount: checkout.pricing.voucherDiscount,
    shippingFee: checkout.pricing.shippingFee,
    totalAmount: checkout.pricing.finalTotal,

    // Voucher
    voucherId: checkout.appliedVoucher?.id,

    // Order items
    items: checkout.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.finalPrice,
      promotionDiscount: item.totalDiscount,
    })),

    // Gift items
    gifts: checkout.gifts.map((gift) => ({
      variantId: gift.variantId,
      quantity: gift.quantity,
    })),
  };
};
