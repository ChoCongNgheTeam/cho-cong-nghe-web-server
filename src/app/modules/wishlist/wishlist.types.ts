export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    brandId: string;
    categoryId: string;
    ratingAverage: any; // Decimal from Prisma
    ratingCount: number;
    variants: Array<{
      price: any; // Decimal
    }>;
    img: Array<{
      id: string;
      color: string;
      imageUrl: string | null;
      altText: string | null;
      position: number;
    }>;
  };
}

export interface WishlistPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WishlistResponse {
  data: WishlistItem[];
  meta: WishlistPaginationMeta;
  message: string;
}

export interface AddToWishlistResponse {
  data: WishlistItem;
  message: string;
}

export interface RemoveFromWishlistResponse {
  message: string;
}