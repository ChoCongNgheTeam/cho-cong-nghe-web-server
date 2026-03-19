import { calculateCartPrice } from "../pricing.service";
import { PricingProductInput } from "../pricing.types";

export interface CheckoutItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  basePrice: number;
  brandId?: string;
  categoryPath?: string[];
  /** Forward từ cart/product để ATTRIBUTE promotion match đúng */
  variantAttributes?: { code: string; value: string }[];
  productName: string;
  productSlug: string;
  variantImage?: string;
  variantAttributes2?: { attributeName: string; optionValue: string }[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  fee: number;
  estimatedDays: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";
  description?: string;
}

export interface CheckoutWithPricingResponse {
  items: {
    productId: string;
    variantId: string;
    productName: string;
    productSlug: string;
    variantImage?: string;
    variantAttributes?: { attributeName: string; optionValue: string }[];
    quantity: number;
    basePrice: number;
    finalPrice: number;
    totalBasePrice: number;
    totalFinalPrice: number;
    totalDiscount: number;
    promotions: { id: string; name: string; description: string; discountAmount: number }[];
  }[];
  gifts: { variantId: string; quantity: number; productName?: string; productImage?: string }[];
  pricing: {
    subtotal: number;
    promotionDiscount: number;
    voucherDiscount: number;
    totalDiscount: number;
    shippingFee: number;
    finalTotal: number;
  };
  appliedVoucher?: { id: string; code: string; discountAmount: number; description: string };
  isValid: boolean;
  errors: string[];
}

export const getCheckoutWithPricing = async (checkoutItems: CheckoutItemInput[], shippingFee: number = 0, userId?: string, voucherCode?: string): Promise<CheckoutWithPricingResponse> => {
  const pricingInput: PricingProductInput[] = checkoutItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    basePrice: item.basePrice,
    quantity: item.quantity,
    brandId: item.brandId,
    categoryPath: item.categoryPath,
    variantAttributes: item.variantAttributes, // ← forward ATTRIBUTE data
  }));

  const pricingResult = await calculateCartPrice({ items: pricingInput, userId, voucherCode });

  const items = pricingResult.items.map((pricedItem, index) => {
    const orig = checkoutItems[index];
    return {
      productId: pricedItem.productId,
      variantId: pricedItem.variantId,
      productName: orig.productName,
      productSlug: orig.productSlug,
      variantImage: orig.variantImage,
      variantAttributes: orig.variantAttributes2,
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

  return {
    items,
    gifts: pricingResult.totalGifts,
    pricing: {
      subtotal: pricingResult.subtotal,
      promotionDiscount: pricingResult.totalPromotionDiscount,
      voucherDiscount: pricingResult.totalVoucherDiscount,
      totalDiscount: pricingResult.totalDiscount,
      shippingFee,
      finalTotal: pricingResult.finalTotal + shippingFee,
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

export const validateCheckoutBeforeOrder = async (checkoutItems: CheckoutItemInput[], shippingFee: number, userId?: string, voucherCode?: string) => {
  const errors: string[] = [];
  if (checkoutItems.length === 0) return { isValid: false, errors: ["Không có sản phẩm nào để thanh toán"] };
  if (shippingFee < 0) return { isValid: false, errors: ["Phí vận chuyển không hợp lệ"] };

  const checkout = await getCheckoutWithPricing(checkoutItems, shippingFee, userId, voucherCode);
  if (!checkout.isValid) errors.push(...checkout.errors);
  if (checkout.pricing.finalTotal <= 0) errors.push("Tổng giá trị đơn hàng không hợp lệ");

  return { isValid: errors.length === 0, errors, checkout: errors.length === 0 ? checkout : undefined };
};

export const calculateShippingFee = async (checkoutItems: CheckoutItemInput[], shippingAddress: { provinceId: string; districtId: string; wardId: string }, shippingMethodId?: string) => {
  const availableMethods: ShippingMethod[] = [
    { id: "standard", name: "Giao hàng tiêu chuẩn", fee: 30000, estimatedDays: "3-5 ngày" },
    { id: "express", name: "Giao hàng nhanh", fee: 50000, estimatedDays: "1-2 ngày" },
  ];
  const selected = availableMethods.find((m) => m.id === shippingMethodId) ?? availableMethods[0];
  return { fee: selected.fee, estimatedDays: selected.estimatedDays, availableMethods };
};

export const previewOrder = async (
  checkoutItems: CheckoutItemInput[],
  shippingAddress: { provinceId: string; districtId: string; wardId: string },
  userId?: string,
  voucherCode?: string,
  shippingMethodId?: string,
) => {
  const shipping = await calculateShippingFee(checkoutItems, shippingAddress, shippingMethodId);
  const checkout = await getCheckoutWithPricing(checkoutItems, shipping.fee, userId, voucherCode);
  const paymentMethods: PaymentMethod[] = [
    { id: "cod", name: "Thanh toán khi nhận hàng (COD)", type: "COD", description: "Thanh toán bằng tiền mặt khi nhận hàng" },
    { id: "bank_transfer", name: "Chuyển khoản ngân hàng", type: "BANK_TRANSFER", description: "Chuyển khoản qua ngân hàng" },
    { id: "vnpay", name: "VNPay", type: "VNPAY", description: "Thanh toán qua VNPay" },
  ];
  return { checkout, shipping: { fee: shipping.fee, estimatedDays: shipping.estimatedDays, availableMethods: shipping.availableMethods }, paymentMethods };
};

export const prepareOrderData = async (
  checkoutItems: CheckoutItemInput[],
  checkout: CheckoutWithPricingResponse,
  orderInfo: {
    userId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: { address: string; wardId: string; districtId: string; provinceId: string };
    paymentMethodId: string;
    notes?: string;
  },
) => ({
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
  subtotal: checkout.pricing.subtotal,
  promotionDiscount: checkout.pricing.promotionDiscount,
  voucherDiscount: checkout.pricing.voucherDiscount,
  shippingFee: checkout.pricing.shippingFee,
  totalAmount: checkout.pricing.finalTotal,
  voucherId: checkout.appliedVoucher?.id,
  items: checkout.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.finalPrice,
    promotionDiscount: item.totalDiscount,
  })),
  gifts: checkout.gifts.map((g) => ({ variantId: g.variantId, quantity: g.quantity })),
});
