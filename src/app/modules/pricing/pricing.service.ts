import {
  PricingProductInput,
  PricingCartInput,
  PricingResult,
  PricedProduct,
  PricingContext,
  AppliedDiscount,
  DisplayPromotion,
} from "./pricing.types";
import {
  getBestPromotionRule,
  calculatePromotionRuleDiscount,
  isVoucherValid,
  calculateVoucherDiscount,
  getApplicablePromotionRules,
  getAllAvailablePromotions,
} from "./pricing.rules";
import {
  calculateDiscountPercentage,
  formatPromotionDescription,
  formatVoucherDescription,
  validatePricingInput,
} from "./pricing.helpers";
import { PromotionActionType } from "@prisma/client";
import * as promotionRepo from "../promotion/promotion.repository";
import * as voucherRepo from "../voucher/voucher.repository";

/**
 * ===== CORE FUNCTION =====
 * Tính giá cho 1 sản phẩm (dùng trong product detail, cart item)
 * @param input - Product pricing input
 * @param userId - User ID (optional)
 * @param mode - "detail" = show all promotions, "cart" = apply with quantity check
 */
export const calculateProductPrice = async (
  input: PricingProductInput,
  userId?: string,
  mode: "detail" | "cart" = "cart",
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

  let finalPrice = input.basePrice;
  let totalDiscount = 0;
  const appliedPromotions: AppliedDiscount[] = [];
  const availablePromotions: DisplayPromotion[] = [];
  const giftProducts: { variantId: string; quantity: number }[] = [];

  if (mode === "detail") {
    // DETAIL MODE: Show ALL available promotions (no quantity check for display)
    const allPromotions = getAllAvailablePromotions(input.productId, input.brandId, context);

    availablePromotions.push(...allPromotions);

    // Still apply best discount for price display
    const bestPromotionResult = getBestPromotionRule(
      input.productId,
      input.basePrice,
      input.quantity,
      input.categoryPath,
      input.brandId,
      context,
    );

    if (bestPromotionResult) {
      const { promotion, rule } = bestPromotionResult;
      const { discountAmount } = calculatePromotionRuleDiscount(
        rule,
        input.basePrice,
        input.quantity,
        promotion.maxDiscountValue,
      );

      finalPrice = input.basePrice - discountAmount / input.quantity;
      totalDiscount = discountAmount;

      appliedPromotions.push({
        type: "PROMOTION",
        id: promotion.id,
        name: promotion.name,
        discountAmount,
        description: formatPromotionDescription(rule),
        actionType: rule.actionType,
      });
    }
  } else {
    // CART MODE: Apply promotions with quantity validation
    const bestPromotionResult = getBestPromotionRule(
      input.productId,
      input.basePrice,
      input.quantity,
      input.categoryPath,
      input.brandId,
      context,
    );

    const addedPromotionIds = new Set<string>();

    for (const promotion of context.availablePromotions) {
      const applicableRules = getApplicablePromotionRules(
        promotion,
        input.productId,
        input.quantity,
        input.brandId,
        context,
      );

      if (applicableRules.length > 0) {
        // Add to available promotions (unique by promotion ID)
        if (!addedPromotionIds.has(promotion.id)) {
          const representativeRule = applicableRules[0];
          availablePromotions.push({
            id: promotion.id,
            name: promotion.name,
            description: formatPromotionDescription(representativeRule),
            actionType: representativeRule.actionType,
            buyQuantity: representativeRule.buyQuantity,
            getQuantity: representativeRule.getQuantity,
            discountValue: representativeRule.discountValue
              ? Number(representativeRule.discountValue)
              : undefined,
          });
          addedPromotionIds.add(promotion.id);
        }

        // Apply promotion if it's the best one
        if (bestPromotionResult && bestPromotionResult.promotion.id === promotion.id) {
          const { rule } = bestPromotionResult;
          const { discountAmount } = calculatePromotionRuleDiscount(
            rule,
            input.basePrice,
            input.quantity,
            promotion.maxDiscountValue,
          );

          finalPrice = input.basePrice - discountAmount / input.quantity;
          totalDiscount = discountAmount;

          if (!appliedPromotions.some((ap) => ap.id === promotion.id)) {
            appliedPromotions.push({
              type: "PROMOTION",
              id: promotion.id,
              name: promotion.name,
              discountAmount,
              description: formatPromotionDescription(rule),
              actionType: rule.actionType,
            });
          }

          // Handle gifts for this promotion
          const giftRules = applicableRules.filter(
            (r) =>
              r.actionType === PromotionActionType.GIFT_PRODUCT &&
              r.giftProductVariantId &&
              r.getQuantity,
          );

          for (const giftRule of giftRules) {
            const sets = giftRule.buyQuantity
              ? Math.floor(input.quantity / giftRule.buyQuantity)
              : 1;

            const giftQuantity = sets * giftRule.getQuantity!;

            if (giftQuantity > 0) {
              giftProducts.push({
                variantId: giftRule.giftProductVariantId!,
                quantity: giftQuantity,
              });

              const giftDescription = formatPromotionDescription(giftRule);
              if (
                !appliedPromotions.some(
                  (ap) =>
                    ap.id === promotion.id && ap.actionType === PromotionActionType.GIFT_PRODUCT,
                )
              ) {
                appliedPromotions.push({
                  type: "PROMOTION",
                  id: promotion.id,
                  name: promotion.name,
                  discountAmount: 0,
                  description: giftDescription,
                  actionType: PromotionActionType.GIFT_PRODUCT,
                });
              }
            }
          }
        }
      }
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
    availablePromotions,
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

  // Calculate price for each item (CART MODE)
  const pricedItems = await Promise.all(
    input.items.map((item) => calculateProductPrice(item, input.userId, "cart")),
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

export const getVariantPricing = async (
  productId: string,
  variantId: string,
  basePrice: number,
  brandId?: string,
  categoryPath?: string[],
  userId?: string,
) => {
  // Use DETAIL MODE to show all promotions
  const pricedProduct = await calculateProductPrice(
    {
      productId,
      variantId,
      basePrice,
      quantity: 1,
      brandId,
      categoryPath,
    },
    userId,
    "detail", // Show all available promotions
  );

  return {
    base: pricedProduct.basePrice,
    final: pricedProduct.finalPrice,
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
    availablePromotions: pricedProduct.availablePromotions,
    gifts: pricedProduct.giftProducts,
  };
};
