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

// NHÓM 1: Bắt buộc, sẽ bỏ
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

export interface AvailableOption {
  attribute: string; // ví dụ: "Color", "Storage"
  values: AvailableOptionValue[];
}

export interface AvailableOptionValue {
  id: string;
  value: string; // ví dụ: "Black", "256GB"
  code: string;
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
  value: string;
  isHighlight?: boolean;
  highlightOrder?: number;
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

export interface ProductCardHighlight {
  key: string;
  name: string;
  icon?: string | null;
  value?: string;
}

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
  highlights: ProductCardHighlight[];

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
  availableOptions: AvailableOption[];
  highlights: Highlight[];
  priceRange: PriceRange;
  // gallery: ProductGallery[];
  warranty?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  currentVariant: ProductVariant;
  // variants: ProductVariant[];
  rating: ReviewStats;

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
