import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";
import { getWishlist } from "../../wishlist/wishlist.service";

export const getWishlistWithPricing = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  // 1. Lấy dữ liệu thô
  const wishlistData = await getWishlist(userId, page, limit);

  if (wishlistData.items.length === 0) return wishlistData;

  // 2. Tính giá cho từng sản phẩm
  const itemsWithPricing = await Promise.all(
    wishlistData.items.map(async (item) => {
      const defaultVariant = item.product.variants?.[0];

      if (!defaultVariant) {
        return { ...item, price: null };
      }

      // Xây dựng Category Path
      const categoryPath: string[] = [];
      const cat = item.product.category;
      if (cat) {
        categoryPath.push(cat.id);
        if (cat.parent) {
          categoryPath.push(cat.parent.id);
          if (cat.parent.parent) categoryPath.push(cat.parent.parent.id);
        }
      }

      // Tính toán giá khuyến mãi
      const fullPricing = await getVariantPricing(
        item.productId,
        defaultVariant.id,
        Number(defaultVariant.price),
        item.product.brandId,
        categoryPath.reverse(),
        userId
      );

      return {
        ...item,
        price: mapPricingToSummary(fullPricing),
      };
    })
  );

  return {
    ...wishlistData,
    items: itemsWithPricing,
  };
};