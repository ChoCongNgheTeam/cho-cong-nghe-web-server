import { getProductsPublic } from "../../product/product.service";
import { ListProductsQuery } from "../../product/product.validation";
import { mapPricingToSummary } from "../pricing.helpers";
import { getVariantPricing } from "../pricing.service";

/**
 * getProductsWithPricing
 *
 * Extract variantAttributes từ pricingContext.variantAttributes
 * (được build bởi buildCardEntry trong product.service)
 * và forward vào getVariantPricing để ATTRIBUTE promotion target hoạt động.
 */
export const getProductsWithPricing = async (query: ListProductsQuery, userId?: string) => {
  const result = await getProductsPublic(query);
  // console.log(result);

  const data = await Promise.all(
    result.data.map(async ({ card, pricingContext }) => {
      if (!pricingContext) return { ...card, pricing: null };
      // console.log(pricingContext.variantAttributes);

      const fullPricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext.brandId,
        pricingContext.categoryPath,
        userId,
        pricingContext.variantAttributes, // ← NEW: pass ATTRIBUTE data
      );

      return {
        ...card,
        price: mapPricingToSummary(fullPricing),
      };
    }),
  );

  return { ...result, data };
};
