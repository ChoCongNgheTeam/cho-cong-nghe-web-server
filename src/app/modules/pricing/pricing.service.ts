import { PricingProductInput, PricingCartInput, PricingResult, PricedProduct, PricingContext, AppliedDiscount, DisplayPromotion } from "./pricing.types";
import {
  // getBestPromotionRule,
  calculatePromotionRuleDiscount,
  isVoucherValid,
  calculateVoucherDiscount,
  getApplicablePromotionRules,
  getAllAvailablePromotions,
  getStackedPromotions,
} from "./pricing.rules";
import { calculateDiscountPercentage, formatPromotionDescription, formatVoucherDescription, validatePricingInput } from "./pricing.helpers";
import { PromotionActionType } from "@prisma/client";
import * as promotionRepo from "../promotion/promotion.repository";
import * as voucherRepo from "../voucher/voucher.repository";

// ─────────────────────────────────────────────────────────────────────────────
// CORE: calculateProductPrice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tính giá cho 1 sản phẩm (product detail hoặc cart item).
 *
 * mode "detail" → hiển thị TẤT CẢ promotions applicable, không check quantity
 * mode "cart"   → chỉ apply promotions đủ điều kiện quantity
 *
 * variantAttributes trong input → được forward vào context để ATTRIBUTE target matching hoạt động.
 */
export const calculateProductPrice = async (input: PricingProductInput, userId?: string, mode: "detail" | "cart" = "cart"): Promise<PricedProduct> => {
  const validation = validatePricingInput(input.basePrice, input.quantity);
  if (!validation.valid) throw new Error(validation.error);

  const context: PricingContext = {
    userId,
    currentDate: new Date(),
    availablePromotions: await promotionRepo.getActivePromotions(),
    categoryPath: input.categoryPath,
    brandId: input.brandId,
    variantAttributes: input.variantAttributes,
  };

  // Stacking engine — xử lý tất cả mode
  const stacked = getStackedPromotions(input.productId, input.basePrice, input.quantity, input.categoryPath, input.brandId, context);

  // console.log(stacked);

  // mode "detail" → trả về TẤT CẢ promotions applicable cho UI hiển thị
  // mode "cart"   → chỉ trả về promotions đã được apply thực tế
  const availablePromotions = mode === "detail" ? getAllAvailablePromotions(input.productId, input.brandId, context) : stacked.availablePromotions;

  return {
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    basePrice: input.basePrice,
    finalPrice: stacked.finalPrice,
    totalBasePrice: input.basePrice * input.quantity,
    totalFinalPrice: stacked.finalPrice * input.quantity,
    totalDiscount: stacked.totalDiscount,
    appliedPromotions: stacked.appliedPromotions,
    availablePromotions,
    giftProducts: stacked.giftProducts.length > 0 ? stacked.giftProducts : undefined,
    hasPromotion: stacked.appliedPromotions.length > 0,
    discountPercentage: calculateDiscountPercentage(input.basePrice, stacked.finalPrice),
    discountBreakdown: stacked.discountBreakdown,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CART PRICING
// ─────────────────────────────────────────────────────────────────────────────

export const calculateCartPrice = async (input: PricingCartInput): Promise<PricingResult> => {
  const errors: string[] = [];

  const pricedItems = await Promise.all(input.items.map((item) => calculateProductPrice(item, input.userId, "cart")));

  const subtotal = pricedItems.reduce((s, i) => s + i.totalFinalPrice, 0);
  const totalPromotionDiscount = pricedItems.reduce((s, i) => s + i.totalDiscount, 0);

  // Collect all gifts
  const totalGifts: { variantId: string; quantity: number }[] = [];
  pricedItems.forEach((item) => {
    item.giftProducts?.forEach((gift) => {
      const existing = totalGifts.find((g) => g.variantId === gift.variantId);
      if (existing) existing.quantity += gift.quantity;
      else totalGifts.push({ ...gift });
    });
  });

  let totalVoucherDiscount = 0;
  let appliedVoucher: AppliedDiscount | undefined;

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
    } catch (e: any) {
      errors.push(e.message || "Lỗi khi áp dụng voucher");
    }
  }

  const finalTotal = subtotal - totalVoucherDiscount;
  const totalDiscount = totalPromotionDiscount + totalVoucherDiscount;

  return {
    items: pricedItems,
    subtotal,
    totalPromotionDiscount,
    totalVoucherDiscount,
    totalDiscount,
    finalTotal: Math.max(finalTotal, 0),
    appliedVoucher,
    totalGifts,
    isValid: errors.length === 0,
    errors,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT PRICING (product detail page)
// ─────────────────────────────────────────────────────────────────────────────

export const getVariantPricing = async (
  productId: string,
  variantId: string,
  basePrice: number,
  brandId?: string,
  categoryPath?: string[],
  userId?: string,
  variantAttributes?: { code: string; value: string }[],
) => {
  const pricedProduct = await calculateProductPrice(
    {
      productId,
      variantId,
      basePrice,
      quantity: 1,
      brandId,
      categoryPath,
      variantAttributes, // ← forward ATTRIBUTE data
    },
    userId,
    "detail",
  );

  // console.log(pricedProduct);

  const hasPromotion = pricedProduct.hasPromotion;

  return {
    base: pricedProduct.basePrice,
    ...(hasPromotion && {
      final: pricedProduct.finalPrice,
      discountAmount: pricedProduct.totalDiscount,
      discountPercentage: pricedProduct.discountPercentage,
    }),
    hasPromotion,
    promotions: pricedProduct.appliedPromotions.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      discountAmount: p.discountAmount,
      actionType: p.actionType,
    })),
    availablePromotions: pricedProduct.availablePromotions,
    gifts: pricedProduct.giftProducts,
  };
};
