import { getRelatedProducts } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

export const getRelatedProductsWithPricing = async (slug: string, limit: number = 8, userId?: string) => {
  const products = await getRelatedProducts(slug, limit);

  return Promise.all(
    products.map(async ({ card, pricingContext }) => {
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
