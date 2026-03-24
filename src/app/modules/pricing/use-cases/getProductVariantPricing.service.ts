import { getProductVariant } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";

export const getProductVariantWithPricing = async (slug: string, options?: Record<string, string>, userId?: string) => {
  const { variant, name, pricingContext, availableOptions } = await getProductVariant(slug, options);

  const price = await getVariantPricing(
    pricingContext.productId,
    pricingContext.variantId,
    pricingContext.price,
    pricingContext.brandId,
    pricingContext.categoryPath,
    userId,
    pricingContext.variantAttributes,
  );

  return {
    currentVariant: { ...variant, name },
    availableOptions,
    price,
  };
};
