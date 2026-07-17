import { MediaType, MediaPosition, CampaignType } from "@prisma/client";

// ============================================================
// Media
// ============================================================

export interface HomeMedia {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
}

export type HomeSlider = HomeMedia;
export type HomeBanner = HomeMedia;

// ============================================================
// Category
// ============================================================

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: number;
}

// ============================================================
// Campaign
// ============================================================

export interface CampaignCategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  imagePath: string | null;
}

export interface CampaignCategory {
  id: string;
  position: number;
  imagePath: string;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
  category: CampaignCategoryItem;
}

export interface HomeCampaign {
  id: string;
  name: string;
  slug: string;
  type: CampaignType;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  categories: CampaignCategory[];
}

// ============================================================
// Sale Schedule
// ============================================================

export interface SaleScheduleRule {
  actionType: string;
  discountValue: number | null;
}

export interface SaleSchedulePromotion {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  priority: number;
  targetsCount: number;
  rules: SaleScheduleRule[];
}

export interface SaleScheduleDay {
  date: string; // "YYYY-MM-DD"
  isToday: boolean;
  hasActiveSale: boolean;
  promotions: SaleSchedulePromotion[];
}

export interface TodayPromotionSummary {
  id: string;
  name: string;
  description: string | null;
  priority: number;
}

export interface TodaySaleProducts {
  products: unknown[];
  total: number;
  date: string;
  startDate: Date | null;
  endDate: Date | null;
  promotions: TodayPromotionSummary[];
}

export interface HomeSaleScheduleResponse {
  schedule: SaleScheduleDay[];
  todayProducts: TodaySaleProducts;
}

// ============================================================
// Shared
// ============================================================

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================
// 3 Response types tương ứng 3 endpoint mới
// ============================================================

/** GET /home/static — ít thay đổi, cache dài */
export interface HomeStaticResponse {
  bannersDeal: HomeBanner[];
  sliders: HomeSlider[];
  bannersTop: HomeBanner[];
  bannersSection1: HomeBanner[];
  featuredCategories: FeaturedCategory[];
  activeCampaigns: HomeCampaign[];
  blogs: PaginatedResult<unknown>;
}

/** GET /home/products — thay đổi vài lần/ngày, cache trung bình */
export interface HomeProductsResponse {
  featuredProducts: unknown[];
  bestSellingProducts: unknown[];
}

/** GET /home/category-products — best selling theo từng category (tab), cache trung bình */
export interface HomeCategoryProductGroup {
  category: { id: string; name: string; slug: string };
  products: unknown[];
}

export interface HomeCategoryProductsResponse {
  groups: HomeCategoryProductGroup[];
}

/** GET /home/sale-schedule — real-time, cache ngắn */
export type HomeSaleScheduleOnlyResponse = HomeSaleScheduleResponse;

// ============================================================
// Service Input Types
// ============================================================

export interface GetProductsByDateOptions {
  promotionId?: string;
  page?: number;
  limit?: number;
}
