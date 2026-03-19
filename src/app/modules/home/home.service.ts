import * as mediaService from "../image-media/media.service";
import * as categoryService from "../category/category.service";
import { campaignService } from "../campaign/campaign.service";
import { getFeaturedProductsWithPricing } from "../pricing/use-cases/getFeaturedProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
import { getRecentlyViewedProductsWithPricing } from "../pricing/use-cases/getRecentlyViewedProductsWithPricing.service";
import * as blogService from "../blog/blog.service";
import { MediaPosition, CampaignType } from "@prisma/client";
import { HomeResponse, HomeCampaign, HomeSaleScheduleResponse } from "./home.types";
import { getSaleScheduleV2, getProductsOnSaleDate } from "../product/product.service";
import { getVariantPricing } from "../pricing/pricing.service";
import { mapPricingToSummary } from "../pricing/pricing.helpers";

// ─────────────────────────────────────────────────────────────────────────────
// PRICING HELPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * enrichProductsWithPricing
 *
 * Enrich { card, pricingContext }[] với giá thực tế từ pricing engine.
 * Forward variantAttributes để ATTRIBUTE promotion target match đúng.
 */
const enrichProductsWithPricing = async (items: Array<{ card: any; pricingContext: any }>, userId?: string): Promise<any[]> =>
  Promise.all(
    items.map(async ({ card, pricingContext }) => {
      if (!pricingContext) return { ...card, price: null };

      const pricing = await getVariantPricing(
        pricingContext.productId,
        pricingContext.variantId,
        pricingContext.price,
        pricingContext.brandId,
        pricingContext.categoryPath,
        userId,
        pricingContext.variantAttributes, // ← forward ATTRIBUTE data
      );

      return { ...card, price: mapPricingToSummary(pricing) };
    }),
  );

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getActiveHomeCampaigns = async (): Promise<HomeCampaign[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allCampaigns = await Promise.all([
    campaignService.getActiveCampaigns(CampaignType.CAMPAIGN),
    campaignService.getActiveCampaigns(CampaignType.SEASONAL),
    campaignService.getActiveCampaigns(CampaignType.EVENT),
  ]);

  const campaigns = allCampaigns.flat().filter((campaign) => {
    const isNotExpired = !campaign.endDate || new Date(campaign.endDate) >= today;
    const isNotFuture = !campaign.startDate || new Date(campaign.startDate) <= today;
    return isNotExpired && isNotFuture;
  });

  const campaignsWithCategories = await Promise.all(campaigns.map((c) => campaignService.getCampaignBySlug(c.slug)));

  return campaignsWithCategories.filter((c) => c.categories && c.categories.length > 0);
};

const getSaleScheduleForHome = async (userId?: string): Promise<HomeSaleScheduleResponse> => {
  const today = new Date();
  const endDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [schedule, todayResult] = await Promise.all([getSaleScheduleV2(today, endDate), getProductsOnSaleDate(today, { limit: 12 })]);

  const todayProductsEnriched = await enrichProductsWithPricing(todayResult.data, userId);

  return {
    schedule,
    todayProducts: {
      products: todayProductsEnriched,
      total: todayResult.total,
      date: todayResult.date as unknown as Date,
      startDate: null,
      endDate: null,
      promotions: todayResult.promotions,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const getHomePageData = async (userId?: string): Promise<HomeResponse> => {
  const [allMedia, featuredCategories, saleSchedule, activeCampaigns, featuredProducts, bestSellingProducts, blogs] = await Promise.all([
    mediaService.getAllActiveMedia(),
    categoryService.getFeaturedCategories(12),
    getSaleScheduleForHome(userId),
    getActiveHomeCampaigns(),
    getFeaturedProductsWithPricing(12, userId),
    getBestSellingProductsWithPricing(12, userId),
    blogService.getBlogsPublic({ page: 1, limit: 7, sortBy: "publishedAt", sortOrder: "desc" }),
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

export const getSaleScheduleSection = async (): Promise<HomeSaleScheduleResponse> => getSaleScheduleForHome();

export const getProductsByDateSection = async (date: Date, options: { promotionId?: string; page?: number; limit?: number } = {}, userId?: string) => {
  const result = await getProductsOnSaleDate(date, { ...options, limit: options.limit ?? 20 });
  const productsEnriched = await enrichProductsWithPricing(result.data, userId);
  return { ...result, data: productsEnriched };
};

export const getBestSellingSection = async (userId?: string, limit: number = 12) => getBestSellingProductsWithPricing(limit, userId);

export const getRecentlyViewedSection = async (productIds: string[], userId?: string) => getRecentlyViewedProductsWithPricing(productIds, userId);

export const getActiveCampaignsSection = async () => getActiveHomeCampaigns();
