// ============================================================
// AI CONTENT TYPES
// ============================================================

export type ContentType = "PRODUCT_DESCRIPTION" | "BLOG_POST";

// ─── Request types ───────────────────────────────────────────

export interface GenerateProductDescriptionInput {
  productId: string; // Để fetch thông số thực từ DB
  focusKeyword: string; // Từ khóa SEO chính
  tone?: "professional" | "friendly" | "enthusiastic"; // Phong cách viết
  targetLength?: "short" | "medium" | "long"; // short~150w, medium~300w, long~500w
  additionalNotes?: string; // Ghi chú thêm cho AI
}

export interface GenerateBlogPostInput {
  title: string; // Tiêu đề bài viết
  focusKeyword: string; // Từ khóa SEO chính
  blogType: "TIN_MOI" | "DANH_GIA" | "KHUYEN_MAI" | "DIEN_MAY" | "NOI_BAT";
  outline?: string; // Dàn ý sơ lược (optional)
  targetLength?: "short" | "medium" | "long"; // short~400w, medium~800w, long~1500w
  additionalNotes?: string;
}

// ─── SEO Analysis ────────────────────────────────────────────

export interface SEOScore {
  overall: number; // 0-100
  details: {
    titleScore: number; // Title có keyword chưa, độ dài đúng không
    keywordDensity: number; // % xuất hiện của keyword
    readabilityScore: number; // Dễ đọc không (câu ngắn, đoạn ngắn)
    lengthScore: number; // Độ dài phù hợp
    metaDescription?: number; // Nếu có meta description
  };
  suggestions: string[]; // Gợi ý cải thiện cụ thể
  keywordCount: number;
  wordCount: number;
}

// ─── Response types ──────────────────────────────────────────

export interface GeneratedContent {
  content: string; // Nội dung đã tạo (HTML hoặc Markdown)
  seoScore: SEOScore;
  suggestedTitle?: string; // Gợi ý title tối ưu SEO
  suggestedSlug?: string; // Gợi ý slug
  suggestedMetaDescription?: string; // Gợi ý meta description (~155 ký tự)
}

// ─── DB model (Prisma schema sẽ thêm bảng này) ──────────────

export interface AiContentRecord {
  id: string;
  type: ContentType;
  referenceId?: string; // productId nếu type = PRODUCT_DESCRIPTION
  focusKeyword: string;
  inputData: Record<string, any>; // Raw input để regenerate
  outputContent: string;
  seoScore: number;
  seoDetails: Record<string, any>;
  createdBy: string; // userId của admin/staff
  createdAt: Date;
  updatedAt: Date;
}
