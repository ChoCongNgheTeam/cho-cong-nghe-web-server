import { getFeaturedProducts } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

export const getFeaturedProductsWithPricing = async (limit: number = 12, userId?: string) => {
  const result = await getFeaturedProducts(limit);

  const productsWithPricing = await Promise.all(
    result.map(async ({ card, pricingContext }) => {
      if (!pricingContext) {
        return { ...card, price: null };
      }

      const pricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext.brandId,
        pricingContext.categoryPath,
        userId,
      );

      return {
        ...card,
        price: mapPricingToSummary(pricing),
      };
    }),
  );

  return productsWithPricing;
};
