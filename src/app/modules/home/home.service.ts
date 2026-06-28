import * as mediaService from "../image-media/media.service";
import * as categoryService from "../category/category.service";
import { getFeaturedProductsWithPricing } from "../pricing/use-cases/getFeaturedProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
import * as blogService from "../blog/blog.service";
import { MediaPosition } from "@prisma/client";
import { HomeResponse } from "./home.types";
import { getProductsOnSaleDate } from "../product/product.service";
import { getActiveHomeCampaigns, getSaleScheduleForHome } from "./home.helpers";
import { enrichProductsWithPricing } from "../pricing/pricing.helpers";

export const getHomePageData = async (userId?: string): Promise<HomeResponse> => {
  const [allMedia, featuredCategories, saleSchedule, activeCampaigns, featuredProducts, bestSellingProducts, blogs] = await Promise.all([
    mediaService.getAllActiveMedia(),
    categoryService.getFeaturedCategories(24),
    getSaleScheduleForHome(userId),
    getActiveHomeCampaigns(),
    getFeaturedProductsWithPricing(12, userId),
    getBestSellingProductsWithPricing(12, userId),
    blogService.getBlogsPublic({ page: 1, limit: 7, sortBy: "publishedAt", sortOrder: "desc", includeDeleted: false }),
  ]);

  const sliders = allMedia[MediaPosition.HOME_TOP] || [];
  const bannersTop = allMedia[MediaPosition.BELOW_SLIDER] || [];
  const bannersSection1 = allMedia[MediaPosition.HOME_SECTION_1] || [];

  return {
    sliders,
    featuredCategories,
    bannersTop,
    saleSchedule,
    bannersSection1,
    activeCampaigns,
    featuredProducts,
    bestSellingProducts,
    blogs,
  };
};

export const getProductsByDateSection = async (date: Date, options: { promotionId?: string; page?: number; limit?: number } = {}, userId?: string) => {
  const result = await getProductsOnSaleDate(date, { ...options, limit: options.limit ?? 20 });
  const productsEnriched = await enrichProductsWithPricing(result.data, userId);
  return { ...result, data: productsEnriched };
};
