import { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { aiContentService } from "./ai-content.service";

// ============================================================
// AI CONTENT CONTROLLER
// Admin-only endpoints
// ============================================================

// POST /api/admin/ai-content/product-description
// Dùng khi sản phẩm đã tồn tại trong DB (có productId)
const generateProductDescription = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body;
  const createdBy = (req as any).user.id;

  const result = await aiContentService.generateProductDescription(input, createdBy);

  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/product-description-from-name
// Dùng khi tạo sản phẩm MỚI, chỉ có tên + keyword, chưa có DB record
const generateProductDescriptionFromName = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body;
  const createdBy = (req as any).user.id;

  const result = await aiContentService.generateProductDescriptionFromName(input, createdBy);

  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/blog
const generateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body;
  const createdBy = (req as any).user.id;

  const result = await aiContentService.generateBlogPost(input, createdBy);

  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/analyze-seo
// Không gọi AI, chỉ analyze JS — nhanh, không timeout
const analyzeSEO = asyncHandler(async (req: Request, res: Response) => {
  const { content, title, focusKeyword, contentType } = req.body;

  const seoScore = aiContentService.analyzeSEOOnly({
    content,
    title,
    focusKeyword,
    contentType: contentType || "product",
  });

  res.status(200).json({ success: true, data: seoScore });
});

// GET /api/admin/ai-content/history
const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { type, referenceId, page, limit } = req.query as any;

  const result = await aiContentService.getContentHistory({
    type,
    referenceId,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });

  res.status(200).json({ success: true, data: result });
});

export const aiContentController = {
  generateProductDescription,
  generateProductDescriptionFromName,
  generateBlogPost,
  analyzeSEO,
  getHistory,
};
