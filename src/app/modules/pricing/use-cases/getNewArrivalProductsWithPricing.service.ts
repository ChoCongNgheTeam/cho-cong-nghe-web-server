import { getNewArrivalProducts } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

export const getNewArrivalProductsWithPricing = async (daysAgo: number = 30, limit: number = 12, userId?: string) => {
  const result = await getNewArrivalProducts(daysAgo, limit);

  return Promise.all(
    result.map(async ({ card, pricingContext }) => {
      if (!pricingContext) return { ...card, price: null };

      const pricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext.brandId,
        pricingContext.categoryPath,
        userId,
        pricingContext.variantAttributes,
      );

      return { ...card, price: mapPricingToSummary(pricing) };
    }),
  );
};
