import { getProductsPublic } from "../../product/product.service";
import { ListProductsQuery } from "../../product/product.validation";
import { mapPricingToSummary } from "../pricing.helpers";
import { getVariantPricing } from "../pricing.service";

export const getProductsWithPricing = async (query: ListProductsQuery, userId?: string) => {
  const result = await getProductsPublic(query);

  const data = await Promise.all(
    result.data.map(async ({ card, pricingContext }) => {
      if (!pricingContext) return { ...card, pricing: null };

      const fullPricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext.brandId,
        pricingContext.categoryPath,
        userId,
        pricingContext.variantAttributes,
      );

      return {
        ...card,
        variantId: pricingContext.variantId, // ← THÊM: override với variantId thực tế được dùng tính giá
        price: mapPricingToSummary(fullPricing),
      };
    }),
  );

  return { ...result, data };
};
