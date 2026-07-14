import { getBestSellingProductsByCategories } from "../../product/product.service";
import { enrichProductsWithPricing } from "../pricing.helpers";

export interface CategoryBestSellingGroup {
  category: { id: string; name: string; slug: string };
  products: Awaited<ReturnType<typeof enrichProductsWithPricing>>;
}

/**
 * Best-selling products theo từng root category (dùng cho các tab loại sản phẩm ở trang chủ).
 * categorySlugs giữ nguyên thứ tự đầu vào ở kết quả trả về.
 */
export const getCategoryBestSellingProductsWithPricing = async (categorySlugs: string[], limitPerCategory: number = 8, userId?: string): Promise<CategoryBestSellingGroup[]> => {
  const groups = await getBestSellingProductsByCategories(categorySlugs, limitPerCategory);

  return Promise.all(
    groups.map(async ({ category, products }) => ({
      category,
      products: await enrichProductsWithPricing(products, userId),
    })),
  );
};
