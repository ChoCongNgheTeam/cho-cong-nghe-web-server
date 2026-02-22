import * as mediaService from "../image-media/media.service";
import * as categoryService from "../category/category.service";
import { campaignService } from "../campaign/campaign.service";
import { getFlashSaleProductsWithPricing } from "../pricing/use-cases/getFlashSaleProductsWithPricing.service";
import { getFeaturedProductsWithPricing } from "../pricing/use-cases/getFeaturedProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
import { getRecentlyViewedProductsWithPricing } from "../pricing/use-cases/getRecentlyViewedProductsWithPricing.service";
import * as blogService from "../blog/blog.service";
import { MediaPosition, CampaignType } from "@prisma/client";
import { HomeResponse, HomeCampaign } from "./home.types";

/**
 * Get active campaigns for home page
 * Only campaigns that are:
 * - isActive = true
 * - Not expired (if endDate is set, must be >= today)
 * - Not future (if startDate is set, must be <= today)
 * - Type is CAMPAIGN, SEASONAL, or EVENT (not RANKING)
 */
const getActiveHomeCampaigns = async (): Promise<HomeCampaign[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day

  // Get all active campaigns (CAMPAIGN, SEASONAL, EVENT only)
  const allCampaigns = await Promise.all([
    campaignService.getActiveCampaigns(CampaignType.CAMPAIGN),
    campaignService.getActiveCampaigns(CampaignType.SEASONAL),
    campaignService.getActiveCampaigns(CampaignType.EVENT),
  ]);

  // console.log(allCampaigns);

  // Flatten and filter by date
  const campaigns = allCampaigns.flat().filter((campaign) => {
    // Check if campaign is within valid date range
    const isNotExpired = !campaign.endDate || new Date(campaign.endDate) >= today;
    const isNotFuture = !campaign.startDate || new Date(campaign.startDate) <= today;

    return isNotExpired && isNotFuture;
  });

  console.log(campaigns);

  // Get full campaign details with categories
  const campaignsWithCategories = await Promise.all(campaigns.map((campaign) => campaignService.getCampaignBySlug(campaign.slug)));
  console.log(campaignsWithCategories);

  // Filter out campaigns with no categories
  return campaignsWithCategories.filter((campaign) => campaign.categories && campaign.categories.length > 0);
};

export const getHomePageData = async (userId?: string): Promise<HomeResponse> => {
  const today = new Date();

  // Parallel queries to optimize performance
  const [allMedia, featuredCategories, flashSaleResult, activeCampaigns, featuredProducts, bestSellingProducts, blogs] = await Promise.all([
    mediaService.getAllActiveMedia(),

    categoryService.getFeaturedCategories(12),

    getFlashSaleProductsWithPricing(today, { limit: 12 }, userId),

    // NEW: Get active campaigns instead of category ranking
    getActiveHomeCampaigns(),

    getFeaturedProductsWithPricing(12, userId),

    getBestSellingProductsWithPricing(12, userId),

    blogService.getBlogsPublic({
      page: 1,
      limit: 7,
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
    // NEW: Active campaigns with categories
    activeCampaigns,
    featuredProducts,
    bestSellingProducts,
    blogs,
  };
};

/**
 * Optional: Get specific section data
 * Used for lazy loading or refreshing individual sections
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

/**
 * NEW: Get active campaigns section only
 * Can be used to refresh campaigns without reloading entire page
 */
export const getActiveCampaignsSection = async () => {
  return getActiveHomeCampaigns();
};
