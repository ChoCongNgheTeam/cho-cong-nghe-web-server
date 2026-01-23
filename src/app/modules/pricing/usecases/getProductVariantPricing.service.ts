import { getProductVariant } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";

export const getProductVariantWithPricing = async (
  slug: string,
  options?: Record<string, string>,
  userId?: string,
) => {
  const { variant, pricingContext, availableOptions } = await getProductVariant(slug, options);

  const price = await getVariantPricing(
    pricingContext.productId,
    variant.id,
    Number(variant.price),
    pricingContext,
    userId,
  );

  return {
    currentVariant: variant,
    availableOptions,
    price,
  };
};
