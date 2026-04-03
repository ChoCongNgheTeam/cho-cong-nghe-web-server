import { z } from "zod";

// ─── Generate Product Description ───────────────────────────
export const generateProductDescriptionSchema = z.object({
  productId: z.string().uuid("productId phải là UUID hợp lệ"),
  focusKeyword: z.string().min(2, "Từ khóa tối thiểu 2 ký tự").max(100, "Từ khóa tối đa 100 ký tự"),
  tone: z.enum(["professional", "friendly", "enthusiastic"]).default("friendly"),
  targetLength: z.enum(["short", "medium", "long"]).default("medium"),
  additionalNotes: z.string().max(500).optional(),
});

// ─── Generate Blog Post ──────────────────────────────────────
export const generateBlogPostSchema = z.object({
  title: z.string().min(10, "Tiêu đề tối thiểu 10 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  focusKeyword: z.string().min(2, "Từ khóa tối thiểu 2 ký tự").max(100, "Từ khóa tối đa 100 ký tự"),
  blogType: z.enum(["TIN_MOI", "DANH_GIA", "KHUYEN_MAI", "DIEN_MAY", "NOI_BAT"]),
  outline: z.string().max(1000).optional(),
  targetLength: z.enum(["short", "medium", "long"]).default("medium"),
  additionalNotes: z.string().max(500).optional(),
});

// ─── Analyze SEO Only ────────────────────────────────────────
export const analyzeSEOSchema = z.object({
  content: z.string().min(50, "Nội dung tối thiểu 50 ký tự"),
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  focusKeyword: z.string().min(2, "Từ khóa tối thiểu 2 ký tự"),
  contentType: z.enum(["product", "blog"]).default("product"),
});

// ─── Get History ─────────────────────────────────────────────
export const contentHistorySchema = z.object({
  type: z.enum(["PRODUCT_DESCRIPTION", "BLOG_POST"]).optional(),
  referenceId: z.string().uuid().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
});

export type GenerateProductDescriptionInput = z.infer<typeof generateProductDescriptionSchema>;
export type GenerateBlogPostInput = z.infer<typeof generateBlogPostSchema>;
export type AnalyzeSEOInput = z.infer<typeof analyzeSEOSchema>;
