import { CampaignType, MediaPosition } from "@prisma/client";

import { getAllActiveMedia } from "../image-media/media.service";
import { getFeaturedCategories } from "../category/category.service";
import { getFeaturedProductsWithPricing } from "../pricing/use-cases/getFeaturedProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
import { getCategoryBestSellingProductsWithPricing } from "../pricing/use-cases/getCategoryBestSellingProductsWithPricing.service";
import { getBlogsPublic } from "../blog/blog.service";
import { getProductsOnSaleDate, getSaleScheduleV2 } from "../product/product.service";
import { campaignService } from "../campaign/campaign.service";
import { enrichProductsWithPricing } from "../pricing/pricing.helpers";

import { GetProductsByDateOptions, HomeCampaign, HomeProductsResponse, HomeCategoryProductsResponse, HomeSaleScheduleOnlyResponse, HomeStaticResponse } from "./home.types";
import {
  HOME_BEST_SELLING_PRODUCT_LIMIT,
  HOME_BLOG_CONFIG,
  HOME_CATEGORY_PRODUCT_LIMIT,
  HOME_CATEGORY_PRODUCT_TABS,
  HOME_FEATURED_CATEGORY_LIMIT,
  HOME_FEATURED_PRODUCT_LIMIT,
  HOME_SALE_BY_DATE_DEFAULT_LIMIT,
  HOME_SALE_SCHEDULE_DAYS,
  HOME_TODAY_SALE_PRODUCT_LIMIT,
  VN_TIMEZONE,
} from "./home.constants";

// ============================================================
// Private — Date Utilities
// ============================================================

const getTodayVNString = (): string => new Date().toLocaleDateString("en-CA", { timeZone: VN_TIMEZONE });

const toVNStartOfDay = (dateStr: string): Date => new Date(`${dateStr}T00:00:00+07:00`);

// ============================================================
// Private — Campaign Builder
// ============================================================

const ACTIVE_CAMPAIGN_TYPES = [CampaignType.CAMPAIGN, CampaignType.SEASONAL, CampaignType.EVENT, CampaignType.FLASH_SALE] as const;

const buildActiveCampaigns = async (): Promise<HomeCampaign[]> => {
  const results = await Promise.all(ACTIVE_CAMPAIGN_TYPES.map((type) => campaignService.getActiveCampaigns(type)));

  const campaigns = results.flat();
  if (campaigns.length === 0) return [];

  // TODO: Thay bằng getCampaignsWithCategoriesByIds khi clean module campaign
  const campaignsWithCategories = await Promise.all(campaigns.map((c) => campaignService.getCampaignBySlug(c.slug)));

  return campaignsWithCategories
    .filter((c) => Array.isArray(c.categories) && c.categories.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      type: c.type,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      categories: c.categories.map((cat: any) => ({
        id: cat.id,
        position: cat.position,
        imagePath: cat.imagePath,
        imageUrl: cat.imageUrl,
        title: cat.title,
        description: cat.description,
        category: {
          id: cat.category.id,
          name: cat.category.name,
          slug: cat.category.slug,
          imageUrl: cat.category.imageUrl,
          imagePath: cat.category.imagePath,
        },
      })),
    })) satisfies HomeCampaign[];
};

// ============================================================
// Public Service Functions — 1 function / 1 endpoint
// ============================================================

/**
 * GET /home/static
 * Data ít thay đổi: banners, categories, campaigns, blogs.
 * FE cache với revalidate dài (3600s) + tag "home-static".
 */
export const getHomeStaticData = async (): Promise<HomeStaticResponse> => {
  const [allMedia, featuredCategories, activeCampaigns, blogs] = await Promise.all([
    getAllActiveMedia(),
    getFeaturedCategories(HOME_FEATURED_CATEGORY_LIMIT),
    buildActiveCampaigns(),
    getBlogsPublic(HOME_BLOG_CONFIG),
  ]);

  return {
    sliders: allMedia[MediaPosition.HOME_TOP] ?? [],
    bannersTop: allMedia[MediaPosition.BELOW_SLIDER] ?? [],
    bannersSection1: allMedia[MediaPosition.HOME_SECTION_1] ?? [],
    featuredCategories,
    activeCampaigns,
    blogs,
  };
};

/**
 * GET /home/products
 * Sản phẩm nổi bật + bán chạy — thay đổi vài lần/ngày.
 * FE cache với revalidate trung bình (300s) + tag "home-products".
 * userId optional để personalize giá cho user đã login.
 */
export const getHomeProductsData = async (userId?: string): Promise<HomeProductsResponse> => {
  const [featuredProducts, bestSellingProducts] = await Promise.all([
    getFeaturedProductsWithPricing(HOME_FEATURED_PRODUCT_LIMIT, userId),
    getBestSellingProductsWithPricing(HOME_BEST_SELLING_PRODUCT_LIMIT, userId),
  ]);

  return { featuredProducts, bestSellingProducts };
};

/**
 * GET /home/sale-schedule
 * Lịch sale + sản phẩm hôm nay — cần tương đối real-time.
 * FE cache với revalidate ngắn (60s) + tag "sale-schedule".
 * userId optional để personalize giá.
 */
export const getHomeSaleScheduleData = async (userId?: string): Promise<HomeSaleScheduleOnlyResponse> => {
  const todayStr = getTodayVNString();
  const todayVN = toVNStartOfDay(todayStr);

  const scheduleEndDate = toVNStartOfDay(todayStr);
  scheduleEndDate.setDate(scheduleEndDate.getDate() + HOME_SALE_SCHEDULE_DAYS);

  const [schedule, todayResult] = await Promise.all([
    getSaleScheduleV2(todayVN, scheduleEndDate),
    getProductsOnSaleDate(todayVN, {
      limit: HOME_TODAY_SALE_PRODUCT_LIMIT,
      activeNow: true,
    }),
  ]);

  const products = await enrichProductsWithPricing(todayResult.data, userId);

  return {
    schedule,
    todayProducts: {
      products,
      total: todayResult.total,
      date: todayResult.date as string,
      startDate: null,
      endDate: null,
      promotions: todayResult.promotions,
    },
  };
};

/**
 * GET /home/category-products
 * Best-selling products theo từng tab category (điện thoại/laptop/điện máy/phụ kiện).
 * FE cache với revalidate trung bình (300s) + tag "home-category-products".
 * userId optional để personalize giá cho user đã login.
 */
export const getHomeCategoryProductsData = async (userId?: string): Promise<HomeCategoryProductsResponse> => {
  const groups = await getCategoryBestSellingProductsWithPricing([...HOME_CATEGORY_PRODUCT_TABS], HOME_CATEGORY_PRODUCT_LIMIT, userId);

  return { groups };
};

/**
 * GET /home/sale-by-date?date=YYYY-MM-DD
 * Sản phẩm sale theo ngày cụ thể — dùng cho tab lịch sale.
 * Không cache vì phụ thuộc query param động.
 */
export const getProductsByDateSection = async (date: Date, options: GetProductsByDateOptions = {}, userId?: string) => {
  const result = await getProductsOnSaleDate(date, {
    ...options,
    limit: options.limit ?? HOME_SALE_BY_DATE_DEFAULT_LIMIT,
  });

  const products = await enrichProductsWithPricing(result.data, userId);

  return { ...result, data: products };
};
