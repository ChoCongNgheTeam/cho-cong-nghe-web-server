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

// ============ NEW: Campaign Types ============

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
  bannersSection1: HomeBanner[];
  // NEW: Replace categoryRanking with activeCampaigns
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
