import * as mediaService from "../image-media/media.service";
import * as categoryService from "../category/category.service";
import * as productService from "../product/product.service";
import { getFlashSaleProductsWithPricing } from "../pricing/use-cases/getFlashSaleProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
// import { getFeaturedProductsByCategoriesWithPricing } from "../pricing/use-cases/getFeaturedProductsByCategoriesWithPricing.service";
import * as blogService from "../blog/blog.service";
import { MediaPosition } from "@prisma/client";
import { HomeResponse } from "./home.types";

/**
 * Home Page Orchestrator
 * Tổng hợp tất cả data cần thiết cho trang Home trong 1 request duy nhất
 *
 * Sections (từ trên xuống):
 * 1. Sliders (HOME_TOP)
 * 2. Banners dưới slider (BELOW_SLIDER)
 * 3. Flash Sale Products (sản phẩm đang sale hôm nay)
 * 4. Banners Section 1 (HOME_SECTION_1)
 * 5. Sale Categories (danh mục có sản phẩm sale)
 * 6. Best Selling Products (sản phẩm bán chạy)
 * 7. Featured Sections (sản phẩm nổi bật theo category)
 * 8. Blogs (bài viết mới nhất)
 * 9. Featured Categories (danh mục nổi bật)
 */
export const getHomePageData = async (userId?: string): Promise<HomeResponse> => {
  const today = new Date();

  // Parallel queries để tối ưu performance
  const [
    // 1. Media (sliders + banners)
    allMedia,

    // 2. Flash Sale Products
    flashSaleResult,

    // 3. Sale Categories
    saleCategoriesData,

    // 4. Best Selling Products
    bestSellingProducts,

    // 5. Featured Sections (categories + products)
    // featuredSections,

    // 6. Blogs
    blogs,

    // 7. Featured Categories
    featuredCategories,
  ] = await Promise.all([
    // 1. Lấy tất cả media active và group by position
    mediaService.getAllActiveMedia(),

    // 2. Flash Sale Products (limit 20)
    getFlashSaleProductsWithPricing(today, { limit: 12 }, userId),

    // 3. Categories có sản phẩm sale
    productService.getCategoriesWithSaleProducts(today),

    // 4. Best Selling Products (limit 12)
    getBestSellingProductsWithPricing(12, userId),

    // 5. Featured Products by Categories (8 products per category, 6 categories)
    // getFeaturedProductsByCategoriesWithPricing(
    //   {
    //     limit: 8,
    //     categoriesLimit: 6,
    //   },
    //   userId,
    // ),

    // 6. Latest Blogs (limit 6)
    blogService.getBlogsPublic({
      page: 1,
      limit: 6,
      sortBy: "publishedAt",
      sortOrder: "desc",
    }),

    // 7. Featured Categories (limit 18)
    categoryService.getFeaturedCategories(12),
  ]);

  // Extract media by position
  const sliders = allMedia[MediaPosition.HOME_TOP] || [];
  const bannersTop = allMedia[MediaPosition.BELOW_SLIDER] || [];
  const bannersSection1 = allMedia[MediaPosition.HOME_SECTION_1] || [];

  return {
    sliders,
    bannersTop,
    flashSaleProducts: {
      products: flashSaleResult.data,
      total: flashSaleResult.total,
      date: flashSaleResult.date,
    },
    bannersSection1,
    saleCategoriesWithCount: saleCategoriesData,
    bestSellingProducts,
    // featuredSections,
    blogs,
    featuredCategories,
  };
};

/**
 * Optional: Get specific section data
 * Có thể dùng để lazy load hoặc refresh từng section riêng lẻ
 */
export const getFlashSaleSection = async (userId?: string, date?: Date) => {
  const saleDate = date || new Date();
  return getFlashSaleProductsWithPricing(saleDate, { limit: 20 }, userId);
};

export const getBestSellingSection = async (userId?: string, limit: number = 12) => {
  return getBestSellingProductsWithPricing(limit, userId);
};

// export const getFeaturedSection = async (
//   userId?: string,
//   options?: {
//     limit?: number;
//     categoriesLimit?: number;
//   },
// ) => {
//   return getFeaturedProductsByCategoriesWithPricing(
//     {
//       limit: options?.limit || 8,
//       categoriesLimit: options?.categoriesLimit || 6,
//     },
//     userId,
//   );
// };
