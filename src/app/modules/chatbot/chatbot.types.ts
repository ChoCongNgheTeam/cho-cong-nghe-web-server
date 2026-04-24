// ============================================================
// CHATBOT TYPES
// ============================================================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
}

// ─── ProductCard: dữ liệu gọn để FE render card + nút thêm giỏ ─────────────
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  productUrl: string;
  thumbnail: string;
  priceMin: number;
  priceMax: number;
  originalPriceMin: number;
  originalPriceMax: number;
  inStock: boolean;
  promotionLabel?: string;
  /** Chỉ có khi SP có đúng 1 variant → FE thêm giỏ 1 click không cần chọn */
  defaultVariantId?: string;
  variants?: { id: string; label: string }[];
}

export interface ChatResponse {
  reply: string;
  sessionId?: string;
  toolsUsed?: string[];
  /** Structured product data để FE render card với nút thêm giỏ hàng */
  products?: ProductCard[];
}

// ---- Tool input types ----

export interface SearchProductsArgs {
  keyword?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  storage?: string;
  color?: string;
  specsFilter?: Record<string, string>;
  attrsFilter?: Record<string, string | string[]>;
  limit?: number;
  sortBy?: "PRICE_ASC" | "PRICE_DESC" | "BEST_SELLING";
}

export interface GetProductDetailArgs {
  slug: string;
}

export interface GetPolicyArgs {
  policyType: string;
}

export interface GetPromotionsArgs {
  limit?: number;
}

// ---- Tool result types ----

export interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  productUrl: string;
  thumbnail: string;
  originalPriceMin: number;
  originalPriceMax: number;
  priceMin: number;
  priceMax: number;
  brand: string;
  category: string;
  inStock: boolean;
  rating: number;
  highlights: { name: string; key: string; value: string }[];
  promotionLabel?: string;
  defaultVariantId?: string;
  variants?: { id: string; label: string }[];
}

export interface ProductDetailResult {
  id: string;
  name: string;
  slug: string;
  productUrl: string;
  thumbnail: string;
  description?: string;
  brand: string;
  category: string;
  originalPriceMin: number;
  originalPriceMax: number;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  rating: number;
  promotionLabel?: string;
  specifications: { group: string; items: { name: string; value: string }[] }[];
  variants: {
    id: string; // ← thêm id để FE dùng cho cart API
    label: string;
    originalPrice: number;
    price: number;
    inStock: boolean;
  }[];
}

export interface PolicyResult {
  title: string;
  content: string;
}

export interface PromotionResult {
  name: string;
  description?: string;
  discountSummary: string;
  endDate?: string;
}