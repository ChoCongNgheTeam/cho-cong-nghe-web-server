// ============================================================
// CHATBOT TYPES
// ============================================================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string; // optional: nếu FE có lưu session
}

export interface ChatResponse {
  reply: string;
  sessionId?: string;
  toolsUsed?: string[]; // debug: biết AI gọi tool nào
}

// ---- Tool input types ----

export interface SearchProductsArgs {
  keyword: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  storage?: string;
  color?: string;
  limit?: number;
}

export interface GetProductDetailArgs {
  slug: string;
}

export interface GetPolicyArgs {
  policyType: string; // "WARRANTY" | "RETURN" | "DELIVERY" | etc.
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
  priceMin: number;
  priceMax: number;
  brand: string;
  category: string;
  inStock: boolean;
  rating: number;
  highlights: { name: string; value: string }[];
  promotionLabel?: string; // "Giảm 10%", "Tặng quà"
}

export interface ProductDetailResult {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: string;
  category: string;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  rating: number;
  specifications: { group: string; items: { name: string; value: string }[] }[];
  variants: { label: string; price: number; inStock: boolean }[];
}

export interface PolicyResult {
  title: string;
  content: string; // raw HTML/text từ DB
}

export interface PromotionResult {
  name: string;
  description?: string;
  discountSummary: string; // "Giảm 10% tất cả iPhone"
  endDate?: string;
}
