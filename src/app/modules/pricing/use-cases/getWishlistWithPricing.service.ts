import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";
import { getWishlist } from "../../wishlist/wishlist.service";

export const getWishlistWithPricing = async (userId: string, page: number = 1, limit: number = 10) => {
  const wishlistData = await getWishlist(userId, page, limit);
  if (wishlistData.items.length === 0) return wishlistData;

  const itemsWithPricing = await Promise.all(
    wishlistData.items.map(async (item) => {
      const defaultVariant = item.product.variants?.[0];
      if (!defaultVariant) return { ...item, price: null };

      // Build category path (leaf → root → reverse = root → leaf)
      const categoryPath: string[] = [];
      const cat = item.product.category;
      if (cat) {
        categoryPath.push(cat.id);
        if (cat.parent) {
          categoryPath.push(cat.parent.id);
          if (cat.parent.parent) categoryPath.push(cat.parent.parent.id);
        }
      }

      // Extract variant attributes for ATTRIBUTE promotion matching
      const variantAttributes = (defaultVariant.variantAttributes ?? []).map((va: any) => ({
        code: va.attributeOption?.attribute?.code ?? va.attribute?.code,
        value: va.attributeOption?.value ?? va.value,
      }));

      const fullPricing = await getVariantPricing(item.productId, defaultVariant.id, Number(defaultVariant.price), item.product.brandId, categoryPath.reverse(), userId, variantAttributes);

      return { ...item, price: mapPricingToSummary(fullPricing) };
    }),
  );

  return { ...wishlistData, items: itemsWithPricing };
};
