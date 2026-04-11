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

export interface ChatResponse {
  reply: string;
  sessionId?: string;
  toolsUsed?: string[];
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
  thumbnail: string;
  originalPriceMin: number; // Giá gốc trước giảm
  originalPriceMax: number;
  priceMin: number;         // Giá sau khi áp promotion
  priceMax: number;
  brand: string;
  category: string;
  inStock: boolean;
  rating: number;
  highlights: { name: string; key: string; value: string }[];
  promotionLabel?: string;  // VD: "Giảm 5%", "Tặng quà"
}

export interface ProductDetailResult {
  id: string;
  name: string;
  slug: string;
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
  variants: { label: string; originalPrice: number; price: number; inStock: boolean }[];
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