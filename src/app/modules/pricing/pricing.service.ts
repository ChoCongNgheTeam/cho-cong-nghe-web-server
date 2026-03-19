import { PricingProductInput, PricingCartInput, PricingResult, PricedProduct, PricingContext, AppliedDiscount, DisplayPromotion } from "./pricing.types";
import { getBestPromotionRule, calculatePromotionRuleDiscount, isVoucherValid, calculateVoucherDiscount, getApplicablePromotionRules, getAllAvailablePromotions } from "./pricing.rules";
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

  // Build context — forward variantAttributes để ATTRIBUTE target có thể match
  const context: PricingContext = {
    userId,
    currentDate: new Date(),
    availablePromotions: await promotionRepo.getActivePromotions(),
    categoryPath: input.categoryPath,
    brandId: input.brandId,
    variantAttributes: input.variantAttributes, // ← KEY: ATTRIBUTE support
  };

  let finalPrice = input.basePrice;
  let totalDiscount = 0;
  const appliedPromotions: AppliedDiscount[] = [];
  const availablePromotions: DisplayPromotion[] = [];
  const giftProducts: { variantId: string; quantity: number }[] = [];

  if (mode === "detail") {
    // ── DETAIL MODE ────────────────────────────────────────────────────────
    // Show ALL available promotions (no quantity gate for display)
    const allPromotions = getAllAvailablePromotions(input.productId, input.brandId, context);
    availablePromotions.push(...allPromotions);

    // Still apply best discount for price preview
    const best = getBestPromotionRule(input.productId, input.basePrice, input.quantity, input.categoryPath, input.brandId, context);

    if (best) {
      const { promotion, rule } = best;
      const { discountAmount } = calculatePromotionRuleDiscount(rule, input.basePrice, input.quantity, promotion.maxDiscountValue);

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
    // ── CART MODE ──────────────────────────────────────────────────────────
    const best = getBestPromotionRule(input.productId, input.basePrice, input.quantity, input.categoryPath, input.brandId, context);

    const addedPromotionIds = new Set<string>();

    for (const promotion of context.availablePromotions) {
      const applicableRules = getApplicablePromotionRules(promotion, input.productId, input.quantity, input.brandId, context);
      if (applicableRules.length === 0) continue;

      // Collect available promotions (unique by ID)
      if (!addedPromotionIds.has(promotion.id)) {
        const rep = applicableRules[0];
        availablePromotions.push({
          id: promotion.id,
          name: promotion.name,
          description: formatPromotionDescription(rep),
          actionType: rep.actionType,
          buyQuantity: rep.buyQuantity,
          getQuantity: rep.getQuantity,
          discountValue: rep.discountValue ? Number(rep.discountValue) : undefined,
        });
        addedPromotionIds.add(promotion.id);
      }

      // Apply only the best promotion
      if (best && best.promotion.id === promotion.id) {
        const { rule } = best;
        const { discountAmount } = calculatePromotionRuleDiscount(rule, input.basePrice, input.quantity, promotion.maxDiscountValue);

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

        // Handle gift rules
        const giftRules = applicableRules.filter((r) => r.actionType === PromotionActionType.GIFT_PRODUCT && r.giftProductVariantId && r.getQuantity);

        for (const giftRule of giftRules) {
          const sets = giftRule.buyQuantity ? Math.floor(input.quantity / giftRule.buyQuantity) : 1;
          const giftQty = sets * giftRule.getQuantity!;

          if (giftQty > 0) {
            giftProducts.push({ variantId: giftRule.giftProductVariantId!, quantity: giftQty });

            if (!appliedPromotions.some((ap) => ap.id === promotion.id && ap.actionType === PromotionActionType.GIFT_PRODUCT)) {
              appliedPromotions.push({
                type: "PROMOTION",
                id: promotion.id,
                name: promotion.name,
                discountAmount: 0,
                description: formatPromotionDescription(giftRule),
                actionType: PromotionActionType.GIFT_PRODUCT,
              });
            }
          }
        }
      }
    }
  }
  console.log(
    "ATTR targets:",
    context.availablePromotions
      .flatMap((p) => p.targets)
      .filter((t) => t.targetType === "ATTRIBUTE")
      .map((t) => ({ code: t.targetCode, value: t.targetValue })),
  );

  // Thêm log này vào calculateProductPrice trong pricing.service.ts
  // Đặt ngay SAU khi build context

  // ── DEBUG (xóa sau khi fix) ────────────────────────────────────────────────

  console.log("=== PRICING DEBUG ===");
  console.log("productId:", input.productId);
  console.log("variantAttributes (input):", JSON.stringify(input.variantAttributes));
  console.log("categoryPath:", input.categoryPath);
  console.log("brandId:", input.brandId);
  console.log("");

  // Check tất cả promotions active
  console.log(
    "All active promotions:",
    context.availablePromotions.map((p) => ({
      name: p.name,
      priority: p.priority,
      isActive: p.isActive,
      targets: p.targets.map((t) => ({ type: t.targetType, code: t.targetCode, value: t.targetValue, id: t.targetId })),
    })),
  );

  // Check ATTRIBUTE targets
  const attrTargets = context.availablePromotions.flatMap((p) => p.targets).filter((t) => t.targetType === "ATTRIBUTE");
  console.log("ATTRIBUTE targets:", JSON.stringify(attrTargets));

  // Check từng promotion có match không
  for (const promo of context.availablePromotions) {
    const matches = promo.targets.some((t) => {
      if (t.targetType !== "ATTRIBUTE") return false;
      const attrs = context.variantAttributes ?? [];
      return attrs.some((a) => a.code.toLowerCase() === (t.targetCode ?? "").toLowerCase() && a.value.toLowerCase() === (t.targetValue ?? "").toLowerCase());
    });
    if (matches || promo.targets.some((t) => t.targetType === "ATTRIBUTE")) {
      console.log(`Promo "${promo.name}" ATTRIBUTE match: ${matches}`);
      console.log("  variant attrs:", context.variantAttributes);
      console.log(
        "  promo targets:",
        promo.targets.filter((t) => t.targetType === "ATTRIBUTE"),
      );
    }
  }
  console.log("=====================");
  // ── END DEBUG ──────────────────────────────────────────────────────────────
  return {
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    basePrice: input.basePrice,
    finalPrice,
    totalBasePrice: input.basePrice * input.quantity,
    totalFinalPrice: finalPrice * input.quantity,
    totalDiscount,
    appliedPromotions,
    availablePromotions,
    giftProducts: giftProducts.length > 0 ? giftProducts : undefined,
    hasPromotion: appliedPromotions.length > 0,
    discountPercentage: calculateDiscountPercentage(input.basePrice, finalPrice),
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
