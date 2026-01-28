import { getFlashSaleProducts } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

export const getFlashSaleProductsWithPricing = async (
  date: Date,
  options: {
    limit?: number;
    categoryId?: string;
  },
  userId?: string,
) => {
  const result = await getFlashSaleProducts(date, options);

  const data = await Promise.all(
    result.data.map(async ({ card, pricingContext }) => {
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

  return {
    ...result,
    data,
  };
};
