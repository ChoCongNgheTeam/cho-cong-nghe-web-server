import { getProductBySlug } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";

export const getProductDetailWithPricing = async (slug: string, userId?: string) => {
  const productDetail = await getProductBySlug(slug, userId);

  const currentVariant = productDetail.currentVariant;
  if (!currentVariant) {
    return {
      ...productDetail,
      pricing: null,
    };
  }

  const pricing = await getVariantPricing(
    productDetail.id,
    currentVariant.id,
    Number(currentVariant.price),
    productDetail.pricingContext,
    userId,
  );

  return {
    ...productDetail,
    pricing,
  };
};
