import { getFeaturedProductsByCategories } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

export const getFeaturedProductsByCategoriesWithPricing = async (
  options: {
    limit?: number;
    categoriesLimit?: number;
  } = {},
  userId?: string,
) => {
  const sections = await getFeaturedProductsByCategories(options);

  // console.log(sections);

  const sectionsWithPricing = await Promise.all(
    sections.map(async (section) => {
      const productsWithPricing = await Promise.all(
        section.products.map(async (product: any) => {
          const { pricingContext, ...safeProduct } = product;

          if (!pricingContext) {
            return { ...safeProduct, price: null };
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
            ...safeProduct,
            price: mapPricingToSummary(pricing),
          };
        }),
      );

      // console.log(section);

      return {
        category: section.category,
        products: productsWithPricing,
        total: section.total,
      };
    }),
  );

  return sectionsWithPricing;
};
