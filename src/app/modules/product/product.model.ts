// =====================
// === SHARED TYPES ===
// =====================

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface VariantImage {
  id: string;
  imageUrl: string;
  altText?: string;
  position: number;
}

export interface Inventory {
  quantity: number;
  reservedQuantity: number;
  available: number; // quantity - reservedQuantity
}

// ✅ NHÓM 1: Bắt buộc
export interface AvailableColor {
  name: string;
  hex?: string; // Mã màu để render swatch
  slug?: string; // Để filter URL
  available: boolean; // Ít nhất 1 variant của màu này còn hàng
  variantIds: string[]; // Danh sách variant IDs có màu này
}

export interface AvailableStorage {
  name: string; // "128GB", "256GB", "512GB"
  value: number; // 128, 256, 512 (để sort)
  available: boolean;
  variantIds: string[];
}

export interface PriceRange {
  min: number;
  max: number;
}

// ✅ NHÓM 2: Nên có
export interface ProductGallery {
  id: string;
  imageUrl: string;
  altText?: string;
  position: number;
  type?: "product" | "lifestyle" | "detail"; // Phân loại ảnh
}

// =====================
// === ATTRIBUTE TYPES ===
// =====================

export interface AttributeGroup {
  id: string;
  name: string; // "Color", "Storage", "RAM"
  values: AttributeValue[];
}

export interface AttributeValue {
  id: string;
  value: string; // "Black", "256GB", "8GB"
  variantIds: string[]; // Danh sách variant IDs có attribute này
}

// =====================
// === VARIANT TYPES ===
// =====================

export interface ProductVariant {
  id: string;
  code: string;
  price: number;
  originalPrice?: number; // Giá gốc trước khuyến mãi
  discountPrice?: number; // Giá sau khuyến mãi
  discountPercentage?: number; // % giảm giá
  weight?: number;
  soldCount: number;
  isDefault: boolean;
  isActive: boolean;
  available: boolean; // ✅ Nhóm 1: Còn hàng hay không
  stockStatus: "in_stock" | "low_stock" | "out_of_stock"; // ✅ Nhóm 2
  inventory: Inventory;
  images: VariantImage[];
  attributes: Record<string, string>; // { "Color": "Black", "Storage": "256GB" }
  attributeIds: Record<string, string>; // { "Color": "attr-id-1", "Storage": "attr-id-2" }
}

// =====================
// === HIGHLIGHT/SPEC TYPES ===
// =====================

export interface Specification {
  id: string;
  key: string;
  name: string;
  icon?: string;
  unit?: string;
  value?: string;
}

export interface Highlight {
  id: string;
  key: string;
  name: string;
  icon?: string;
  unit?: string;
}

// =====================
// === REVIEW TYPES ===
// =====================

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isApproved: string;
  createdAt: Date;
  user: {
    id: string;
    fullName?: string;
    avatarImage?: string;
  };
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// =====================
// === PRODUCT LIST (For Card Display) ===
// =====================

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  brand: Brand;

  // Giá từ variant mặc định hoặc variant rẻ nhất
  price: number;
  originalPrice?: number; // Nếu có discount
  discount?: number; // Phần trăm giảm giá

  // Thumbnail từ variant default
  thumbnail: string;

  // Rating
  rating: {
    average: number;
    count: number;
  };

  // Tags
  isFeatured: boolean;
  isNew?: boolean; // Sản phẩm mới trong 30 ngày

  // Quick info
  highlights: string[]; // ["6.1 inch", "48MP", "A16 Bionic"]

  // Availability
  inStock: boolean;
}

// =====================
// === PRODUCT DETAIL (Full Info) ===
// =====================

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: Brand;
  category: Category[];

  // ✅ NHÓM 1: Bắt buộc - FE dùng trực tiếp
  availableColors: AvailableColor[]; // Danh sách màu có sẵn
  availableStorages: AvailableStorage[]; // Danh sách bộ nhớ có sẵn
  priceRange: PriceRange; // Khoảng giá

  // ✅ NHÓM 2: Nên có
  gallery: ProductGallery[]; // Ảnh tổng hợp (tất cả variants + lifestyle)
  warranty?: string; // "12 tháng chính hãng Apple Việt Nam"
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";

  // Current selected variant (default hoặc user chọn)
  currentVariant: ProductVariant;

  // Tất cả variants
  variants: ProductVariant[];

  // Grouped attributes để render selector
  attributes: AttributeGroup[];

  // Highlights (thông số nổi bật)
  highlights: Highlight[];

  // Full specifications
  specifications: Specification[];

  // Rating & Reviews
  rating: ReviewStats;
  reviews: Review[];

  // Meta
  viewsCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================
// === ADMIN TYPES ===
// =====================

export interface ProductAdmin {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  categories: Category[];
  variantCount: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  viewsCount: number;
  rating: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================
// === RESPONSE TYPES ===
// =====================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse extends PaginatedResponse<ProductCard> {
  filters?: {
    brands: { id: string; name: string; count: number }[];
    categories: { id: string; name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
}
