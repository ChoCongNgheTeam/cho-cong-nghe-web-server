import * as mediaService from "../image-media/media.service";
import * as categoryService from "../category/category.service";
import * as productService from "../product/product.service";
import { getFlashSaleProductsWithPricing } from "../pricing/use-cases/getFlashSaleProductsWithPricing.service";
import { getFeaturedProductsWithPricing } from "../pricing/use-cases/getFeaturedProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
import { getRecentlyViewedProductsWithPricing } from "../pricing/use-cases/getRecentlyViewedProductsWithPricing.service"; // đã báo fe
import * as blogService from "../blog/blog.service";
import { MediaPosition } from "@prisma/client";
import { HomeResponse } from "./home.types";

export const getHomePageData = async (userId?: string): Promise<HomeResponse> => {
  const today = new Date();

  // Parallel queries để tối ưu performance
  const [
    allMedia,

    featuredCategories,

    flashSaleResult,

    saleCategoriesData,

    featuredProducts,

    bestSellingProducts,

    blogs,
  ] = await Promise.all([
    mediaService.getAllActiveMedia(),

    categoryService.getFeaturedCategories(12),

    getFlashSaleProductsWithPricing(today, { limit: 12 }, userId),

    productService.getCategoriesWithSaleProducts(today),

    getFeaturedProductsWithPricing(12, userId),

    getBestSellingProductsWithPricing(12, userId),

    blogService.getBlogsPublic({
      page: 1,
      limit: 6,
      sortBy: "publishedAt",
      sortOrder: "desc",
    }),
  ]);

  // Extract media by position
  const sliders = allMedia[MediaPosition.HOME_TOP] || [];
  const bannersTop = allMedia[MediaPosition.BELOW_SLIDER] || [];
  const bannersSection1 = allMedia[MediaPosition.HOME_SECTION_1] || [];

  return {
    sliders,
    featuredCategories,
    bannersTop,
    flashSaleProducts: {
      products: flashSaleResult.data,
      total: flashSaleResult.total,
      date: flashSaleResult.date,
    },
    bannersSection1,
    categoryRanking: saleCategoriesData,
    featuredProducts,
    bestSellingProducts,
    blogs,
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

export const getRecentlyViewedSection = async (productIds: string[], userId?: string) => {
  return getRecentlyViewedProductsWithPricing(productIds, userId);
};
