import { getProductsPublic } from "../../product/product.service";
import { ListProductsQuery } from "../../product/product.validation";
import { getVariantPricing } from "../pricing.service";

export const getProductsWithPricing = async (query: ListProductsQuery, userId?: string) => {
  const result = await getProductsPublic(query);

  const data = await Promise.all(
    result.data.map(async ({ card, pricingContext }) => {
      if (!pricingContext) {
        return { ...card, pricing: null };
      }

      // console.log("pricingContext", pricingContext);

      const pricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext,
        userId,
      );

      return {
        ...card,
        pricing,
      };
    }),
  );

  return { ...result, data };
};
