import { getProductVariantOptions } from "../../product/product.service";
import { mapPricingToSummary } from "../pricing.helpers";
import { getVariantPricing } from "../pricing.service";

export const getProductVariantOptionsWithPricing = async (slug: string, options: Record<string, string>, userId?: string) => {
  //   console.log("[getProductVariantOptionsWithPricing] called", { slug, options, userId });

  // Trả về mảng các variant, mỗi item có pricingContext đính kèm
  const variants = await getProductVariantOptions(slug, options);

  //   console.log("[getProductVariantOptionsWithPricing] variants from service:", variants.length);
  //   console.log("[getProductVariantOptionsWithPricing] first variant sample:", JSON.stringify(variants[0], null, 2));

  const data = await Promise.all(
    variants.map(async (variant) => {
      const { pricingContext, ...rest } = variant as any;

      //   console.log("[getProductVariantOptionsWithPricing] processing variantId:", rest.id, "| pricingContext:", pricingContext ? "OK" : "MISSING");

      if (!pricingContext) {
        console.warn("[getProductVariantOptionsWithPricing] NO pricingContext for variant:", rest.id);
        return { ...rest, price: null };
      }

      const fullPricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext.brandId,
        pricingContext.categoryPath,
        userId,
        pricingContext.variantAttributes,
      );

      //   console.log("[getProductVariantOptionsWithPricing] fullPricing for", rest.id, ":", JSON.stringify(fullPricing, null, 2));

      return {
        ...rest,
        price: mapPricingToSummary(fullPricing),
      };
    }),
  );

  //   console.log("[getProductVariantOptionsWithPricing] done, returning", data.length, "items");
  return data;
};
