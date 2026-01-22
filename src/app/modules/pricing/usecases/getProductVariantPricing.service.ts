import { getProductVariant } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";

export const getProductVariantWithPricing = async (
  slug: string,
  options?: Record<string, string>,
  userId?: string,
) => {
  const { variant, pricingContext, availableOptions } = await getProductVariant(slug, options);

  const pricing = await getVariantPricing(
    pricingContext.productId,
    variant.id,
    Number(variant.price),
    pricingContext,
    userId,
  );

  console.log("pricing", pricing);

  return {
    currentVariant: variant,
    availableOptions,
    pricing,
  };
};
