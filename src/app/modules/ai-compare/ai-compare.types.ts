// ============================================================
// ai.types.ts
// Types cho AI compare module — khớp với product.types.ts pattern
// ============================================================

// ─── Input ───────────────────────────────────────────────────────────────────

export interface AICompareRequestBody {
  productIds: string[];
}

// ─── Transformed product gửi cho AI ─────────────────────────────────────────

export interface AIProductPayload {
  name: string;
  brand: string;
  price_vnd: number;
  specs: Record<string, string>; // { key: "value unit" }
}

// ─── AI response shape ────────────────────────────────────────────────────────

export interface ComparisonCategory {
  category: string;
  analysis: string;
  winner: string;
}

export interface CompareAIResult {
  summary: string;
  comparison: ComparisonCategory[];
  strengths: Record<string, string[]>;
  recommendation: {
    best_performance: string;
    best_value: string;
    best_for_users: {
      gaming: string;
      camera: string;
      battery: string;
    };
  };
}

// ─── Service result trả về client ────────────────────────────────────────────

export interface ProductCompareCard {
  id: string;
  name: string;
  brand: string;
  price: number;
  slug: string;
  thumbnail: string | null;
  highlightSpecs: Record<string, string>; // isHighlight = true
}

export interface AICompareResult {
  products: ProductCompareCard[];
  aiAnalysis: CompareAIResult;
}