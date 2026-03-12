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
    ratingAverage: any; // Decimal từ Prisma
    ratingCount: number;
    
    // Cây danh mục để tính giá
    category?: {
      id: string;
      parent?: {
        id: string;
        parent?: { id: string } | null;
      } | null;
    } | null;

    // Lấy ID và Giá gốc của variant mặc định
    variants: Array<{
      id: string;
      price: any; // Decimal
    }>;

    // Thông số nổi bật (Highlight)
    productSpecifications: Array<{
      value: string;
      specification: {
        name: string;
        unit: string | null;
      };
    }>;

    // Hình ảnh sản phẩm
    img: Array<{
      id: string;
      color: string;
      imageUrl: string | null;
      altText: string | null;
      position: number;
    }>;
  };
  price?: any; // Sẽ được Orchestrator tính toán và gán vào sau
}

export interface WishlistPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WishlistResponse {
  items: WishlistItem[];
  meta: WishlistPaginationMeta;
}