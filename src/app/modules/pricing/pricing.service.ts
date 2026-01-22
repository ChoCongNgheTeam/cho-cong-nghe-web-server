import {
  PricingProductInput,
  PricingCartInput,
  PricingResult,
  PricedProduct,
  PricingContext,
  AppliedDiscount,
  PricingContextInput,
} from "./pricing.types";
import {
  getBestPromotionTarget,
  calculatePromotionTargetDiscount,
  isVoucherValid,
  calculateVoucherDiscount,
} from "./pricing.rules";
import { calculateDiscountPercentage, validatePricingInput } from "./pricing.helpers";
import { PromotionActionType } from "@prisma/client";
import * as promotionRepo from "../promotion/promotion.repository";
import * as voucherRepo from "../voucher/voucher.repository";

/**
 * ===== CORE FUNCTION =====
 * Tính giá cho 1 sản phẩm (dùng trong product detail, cart item)
 */
export const calculateProductPrice = async (
  input: PricingProductInput,
  userId?: string,
): Promise<PricedProduct> => {
  // Validate
  const validation = validatePricingInput(input.basePrice, input.quantity);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Build context
  const context: PricingContext = {
    userId,
    currentDate: new Date(),
    availablePromotions: await promotionRepo.getActivePromotions(),
    categoryPath: input.categoryPath,
    brandId: input.brandId,
  };

  // Find best promotion target for this product
  const bestPromotionResult = getBestPromotionTarget(
    input.productId,
    input.basePrice,
    input.quantity,
    input.categoryPath,
    input.brandId,
    context,
  );

  let finalPrice = input.basePrice;
  let totalDiscount = 0;
  const appliedPromotions: AppliedDiscount[] = [];
  const giftProducts: { variantId: string; quantity: number }[] = [];

  // Apply promotion
  if (bestPromotionResult) {
    const { promotion, target } = bestPromotionResult;
    const { discountAmount, applicableQuantity } = calculatePromotionTargetDiscount(
      target,
      input.basePrice,
      input.quantity,
    );

    finalPrice = input.basePrice - discountAmount / input.quantity;
    totalDiscount = discountAmount;

    appliedPromotions.push({
      type: "PROMOTION",
      id: promotion.id,
      name: promotion.name,
      discountAmount,
      description: formatPromotionDescription(target),
      actionType: target.actionType,
    });

    // Handle gift product
    if (
      target.actionType === PromotionActionType.GIFT_PRODUCT &&
      target.giftProductVariantId &&
      target.getQuantity
    ) {
      const sets = target.buyQuantity ? Math.floor(input.quantity / target.buyQuantity) : 1;
      giftProducts.push({
        variantId: target.giftProductVariantId,
        quantity: sets * target.getQuantity,
      });
    }
  }

  const result: PricedProduct = {
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,

    basePrice: input.basePrice,
    finalPrice,
    totalBasePrice: input.basePrice * input.quantity,
    totalFinalPrice: finalPrice * input.quantity,
    totalDiscount: totalDiscount,

    appliedPromotions,
    giftProducts: giftProducts.length > 0 ? giftProducts : undefined,
    hasPromotion: appliedPromotions.length > 0,
    discountPercentage: calculateDiscountPercentage(input.basePrice, finalPrice),
  };

  return result;
};

/**
 * ===== CART PRICING =====
 * Tính giá cho toàn bộ giỏ hàng (dùng trong cart, checkout)
 */
export const calculateCartPrice = async (input: PricingCartInput): Promise<PricingResult> => {
  const errors: string[] = [];

  // Calculate price for each item
  const pricedItems = await Promise.all(
    input.items.map((item) => calculateProductPrice(item, input.userId)),
  );

  // Calculate subtotal (after promotion)
  const subtotal = pricedItems.reduce((sum, item) => sum + item.totalFinalPrice, 0);

  // Calculate total promotion discount
  const totalPromotionDiscount = pricedItems.reduce((sum, item) => sum + item.totalDiscount, 0);

  // Collect all gifts
  const totalGifts: { variantId: string; quantity: number }[] = [];
  pricedItems.forEach((item) => {
    if (item.giftProducts) {
      item.giftProducts.forEach((gift) => {
        const existing = totalGifts.find((g) => g.variantId === gift.variantId);
        if (existing) {
          existing.quantity += gift.quantity;
        } else {
          totalGifts.push({ ...gift });
        }
      });
    }
  });

  let totalVoucherDiscount = 0;
  let appliedVoucher: AppliedDiscount | undefined;

  // Apply voucher if provided
  if (input.voucherCode) {
    try {
      const voucher = await voucherRepo.getVoucherByCode(input.voucherCode, input.userId);

      if (voucher) {
        const validation = isVoucherValid(voucher, subtotal, {
          userId: input.userId,
          currentDate: new Date(),
          availablePromotions: [],
        });

        if (validation.valid) {
          // Calculate voucher discount for applicable items
          const itemsForVoucher = pricedItems.map((item) => {
            const cartItem = input.items.find((i) => i.productId === item.productId);

            return {
              productId: item.productId,
              categoryPath: cartItem?.categoryPath,
              brandId: cartItem?.brandId,
              totalPrice: item.totalFinalPrice,
            };
          });

          totalVoucherDiscount = calculateVoucherDiscount(voucher, itemsForVoucher);

          appliedVoucher = {
            type: "VOUCHER",
            id: voucher.id,
            name: voucher.code,
            discountAmount: totalVoucherDiscount,
            description: formatVoucherDescription(voucher),
            actionType: voucher.discountType,
          };
        } else {
          errors.push(validation.error || "Voucher không hợp lệ");
        }
      } else {
        errors.push("Voucher không tồn tại");
      }
    } catch (error: any) {
      errors.push(error.message || "Lỗi khi áp dụng voucher");
    }
  }

  // Calculate final total
  const finalTotal = subtotal - totalVoucherDiscount;
  const totalDiscount = totalPromotionDiscount + totalVoucherDiscount;

  return {
    items: pricedItems,
    subtotal,
    totalPromotionDiscount,
    totalVoucherDiscount,
    totalDiscount,
    finalTotal: Math.max(finalTotal, 0), // Không âm
    appliedVoucher,
    totalGifts,
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * ===== PUBLIC API FOR PRODUCT MODULE =====
 * Lấy giá cho variant (dùng khi get product detail)
 */
export const getVariantPricing = async (
  productId: string,
  variantId: string,
  basePrice: number,
  context?: PricingContextInput,
  userId?: string,
) => {
  const pricedProduct = await calculateProductPrice(
    {
      productId,
      variantId,
      basePrice,
      quantity: 1,
      categoryPath: context?.categoryPath,
      brandId: context?.brandId,
    },
    userId,
  );

  return {
    basePrice: pricedProduct.basePrice,
    finalPrice: pricedProduct.finalPrice,
    discountAmount: pricedProduct.totalDiscount,
    discountPercentage: pricedProduct.discountPercentage,
    hasPromotion: pricedProduct.hasPromotion,
    promotions: pricedProduct.appliedPromotions.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      discountAmount: p.discountAmount,
      actionType: p.actionType,
    })),
    gifts: pricedProduct.giftProducts,
  };
};

/**
 * ===== HELPERS =====
 */
const formatPromotionDescription = (target: any): string => {
  switch (target.actionType) {
    case PromotionActionType.DISCOUNT_PERCENT:
      return `Giảm ${target.discountValue}%`;

    case PromotionActionType.DISCOUNT_FIXED:
      return `Giảm ${Number(target.discountValue).toLocaleString()}đ`;

    case PromotionActionType.BUY_X_GET_Y:
      return `Mua ${target.buyQuantity} tặng ${target.getQuantity}`;

    case PromotionActionType.GIFT_PRODUCT:
      return `Tặng quà khi mua ${target.buyQuantity || 1} sản phẩm`;

    default:
      return "Khuyến mãi đặc biệt";
  }
};

const formatVoucherDescription = (voucher: any): string => {
  if (voucher.discountType === "DISCOUNT_PERCENT") {
    return `Giảm ${voucher.discountValue}%`;
  }
  return `Giảm ${Number(voucher.discountValue).toLocaleString()}đ`;
};
