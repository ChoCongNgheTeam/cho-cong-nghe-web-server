import { MediaType, MediaPosition } from "@prisma/client";

export interface HomeSlider {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}

export interface HomeBanner {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}

export interface CategoryWithSaleCount {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  totalProducts: number;
  saleProductsCount: number;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  isFeatured: boolean;
  productsCount: number;
}

export interface HomeResponse {
  sliders: HomeSlider[];
  bannersTop: HomeBanner[];
  flashSaleProducts: {
    products: any[];
    total: number;
    date: Date;
  };
  bannersSection1: HomeBanner[];
  saleCategoriesWithCount: CategoryWithSaleCount[];
  bestSellingProducts: any[];
  // featuredSections: {
  //   category: {
  //     id: string;
  //     name: string;
  //     slug: string;
  //   };
  //   products: any[];
  //   total: number;
  // }[];
  blogs: {
    data: any[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  featuredCategories: FeaturedCategory[];
}
