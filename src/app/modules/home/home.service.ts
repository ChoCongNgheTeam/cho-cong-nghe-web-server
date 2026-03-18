import * as mediaService from "../image-media/media.service";
import * as categoryService from "../category/category.service";
import { campaignService } from "../campaign/campaign.service";
import { getFeaturedProductsWithPricing } from "../pricing/use-cases/getFeaturedProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
import { getRecentlyViewedProductsWithPricing } from "../pricing/use-cases/getRecentlyViewedProductsWithPricing.service";
import * as blogService from "../blog/blog.service";
import { MediaPosition, CampaignType } from "@prisma/client";
import { HomeResponse, HomeCampaign, HomeSaleScheduleResponse } from "./home.types";

// Import service mới từ product module
import { getSaleScheduleV2, getProductsOnSaleDate } from "../product/product.service";
import { getVariantPricing } from "../pricing/pricing.service";
import { mapPricingToSummary } from "../pricing/pricing.helpers";

// ─────────────────────────────────────────────────────────────────────────────
// PRICING HELPER — dùng lại pattern của getFlashSaleProductsWithPricing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enrich { card, pricingContext }[] với giá sale thực tế từ pricing engine.
 * Tương tự getFlashSaleProductsWithPricing nhưng nhận raw items.
 */
const enrichProductsWithPricing = async (items: Array<{ card: any; pricingContext: any }>, userId?: string): Promise<any[]> => {
  return Promise.all(
    items.map(async ({ card, pricingContext }) => {
      if (!pricingContext) return { ...card, price: null };
      const pricing = await getVariantPricing(pricingContext.productId, pricingContext.variantId, pricingContext.price, pricingContext.brandId, pricingContext.categoryPath, userId);
      return { ...card, price: mapPricingToSummary(pricing) };
    }),
  );
};

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

  const campaignsWithCategories = await Promise.all(campaigns.map((campaign) => campaignService.getCampaignBySlug(campaign.slug)));

  return campaignsWithCategories.filter((campaign) => campaign.categories && campaign.categories.length > 0);
};

/**
 * getSaleScheduleForHome
 *
 * Lấy lịch sale 7 ngày từ hôm nay + products flash sale hôm nay.
 * Gọi parallel để không block homepage load.
 */
const getSaleScheduleForHome = async (userId?: string): Promise<HomeSaleScheduleResponse> => {
  const today = new Date();
  const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000); // +6 ngày = 7 ngày tổng

  // Parallel: lịch 7 ngày + products hôm nay
  const [schedule, todayResult] = await Promise.all([getSaleScheduleV2(today, endDate), getProductsOnSaleDate(today, { limit: 12 })]);

  // Enrich pricing — giá sale thực tế (giảm 15%, 10%...) thay vì giá gốc
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
  const today = new Date();

  const [allMedia, featuredCategories, saleSchedule, activeCampaigns, featuredProducts, bestSellingProducts, blogs] = await Promise.all([
    mediaService.getAllActiveMedia(),
    categoryService.getFeaturedCategories(12),
    getSaleScheduleForHome(userId), // lấy cả lịch + today products (có pricing)
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
    // Reuse từ saleSchedule — không query riêng tránh trùng lặp
    // flashSaleProducts: {
    //   products: saleSchedule.todayProducts.products,
    //   total: saleSchedule.todayProducts.total,
    //   date: saleSchedule.todayProducts.date,
    //   startDate: saleSchedule.todayProducts.startDate,
    //   endDate: saleSchedule.todayProducts.endDate,
    // },
    saleSchedule,
    bannersSection1,
    activeCampaigns,
    featuredProducts,
    bestSellingProducts,
    blogs,
  };
};

/**
 * getSaleScheduleSection
 *
 * Endpoint riêng cho FE fetch khi cần refresh lịch sale
 * mà không reload toàn bộ homepage.
 */
export const getSaleScheduleSection = async (): Promise<HomeSaleScheduleResponse> => {
  return getSaleScheduleForHome();
};

/**
 * getProductsByDateSection
 *
 * FE gọi khi user click vào 1 tab ngày trong Flash Sale section.
 * promotionId optional — filter products của 1 promotion cụ thể.
 */
export const getProductsByDateSection = async (date: Date, options: { promotionId?: string; page?: number; limit?: number } = {}, userId?: string) => {
  const result = await getProductsOnSaleDate(date, { ...options, limit: options.limit ?? 20 });

  // Enrich pricing cho từng sản phẩm
  const productsEnriched = await enrichProductsWithPricing(result.data, userId);

  return {
    ...result,
    data: productsEnriched,
  };
};

// ── Giữ nguyên các section handlers cũ ──────────────────────────────────────

// export const getFlashSaleSection = async (userId?: string, date?: Date) => {
//   const saleDate = date || new Date();
//   return getFlashSaleProductsWithPricing(saleDate, { limit: 20 }, userId);
// };

export const getBestSellingSection = async (userId?: string, limit: number = 12) => {
  return getBestSellingProductsWithPricing(limit, userId);
};

export const getRecentlyViewedSection = async (productIds: string[], userId?: string) => {
  return getRecentlyViewedProductsWithPricing(productIds, userId);
};

export const getActiveCampaignsSection = async () => {
  return getActiveHomeCampaigns();
};
