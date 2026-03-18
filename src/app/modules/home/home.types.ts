import { MediaType, MediaPosition, CampaignType } from "@prisma/client";

export interface HomeSlider {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
}

export interface HomeBanner {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: number;
}

// ============ Campaign Types ============

export interface CampaignCategory {
  id: string;
  position: number;
  imagePath: string;
  imageUrl: string | null;
  title: string | null;
  description: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    imagePath: string | null;
  };
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

// ============ Sale Schedule Types ============

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

/** Một ô ngày trong lịch sale */
export interface SaleScheduleDay {
  date: string; // "2026-03-18"
  isToday: boolean;
  hasActiveSale: boolean;
  promotions: SaleSchedulePromotion[];
}

/** Response của GET /home/sale-schedule */
export interface HomeSaleScheduleResponse {
  /** Lịch sale 7 ngày (từ hôm nay) */
  schedule: SaleScheduleDay[];
  /** Flash sale hôm nay — load sẵn để render tab đầu tiên không cần request thêm */
  todayProducts: {
    products: any[];
    total: number;
    date: Date;
    startDate: Date | null;
    endDate: Date | null;
    promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
  };
}

// ============ Home Response ============

export interface HomeResponse {
  sliders: HomeSlider[];
  featuredCategories: FeaturedCategory[];
  bannersTop: HomeBanner[];
  flashSaleProducts: {
    products: any[];
    total: number;
    date: Date;
    startDate: Date | null;
    endDate: Date | null;
  };
  /** Lịch sale 7 ngày kèm products hôm nay — dùng cho section Flash Sale */
  saleSchedule: HomeSaleScheduleResponse;
  bannersSection1: HomeBanner[];
  activeCampaigns: HomeCampaign[];
  featuredProducts: any[];
  bestSellingProducts: any[];
  blogs: {
    data: any[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
