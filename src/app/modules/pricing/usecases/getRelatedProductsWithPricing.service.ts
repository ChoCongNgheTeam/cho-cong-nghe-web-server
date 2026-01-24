import { getRelatedProducts } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

/**
 * Get related products with pricing
 * Similar to getProductsWithPricing but for related products
 */
export const getRelatedProductsWithPricing = async (
  slug: string,
  limit: number = 8,
  userId?: string,
) => {
  const products = await getRelatedProducts(slug, limit);

  const data = await Promise.all(
    products.map(async (product) => {
      const pricingContext = (product as any)._pricingContext;

      // Remove internal field before returning
      const { _pricingContext, ...publicProduct } = product as any;

      if (!pricingContext) {
        return { ...publicProduct, price: null };
      }

      const fullPricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        {
          brandId: pricingContext.brandId,
          categoryId: pricingContext.categoryId,
          categoryPath: pricingContext.categoryPath,
        },
        userId,
      );

      return {
        ...publicProduct,
        price: mapPricingToSummary(fullPricing),
      };
    }),
  );

  return data;
};
