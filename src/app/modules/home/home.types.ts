import { MediaType, MediaPosition } from "@prisma/client";

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

export interface CategoryWithSaleCount {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  totalProducts: number;
  saleProducts: number;
  newProducts: number;
  totalViews: number;
  totalSold: number;
  score: number;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: number;
}

export interface HomeResponse {
  sliders: HomeSlider[];
  featuredCategories: FeaturedCategory[];
  bannersTop: HomeBanner[];
  flashSaleProducts: {
    products: any[];
    total: number;
    date: Date;
  };
  bannersSection1: HomeBanner[];
  categoryRanking: CategoryWithSaleCount[];
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
