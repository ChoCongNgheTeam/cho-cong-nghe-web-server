import { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { aiContentService } from "./ai-content.service";

// ============================================================
// AI CONTENT CONTROLLER
// Admin-only endpoints — KHÔNG gọi DB trực tiếp, chỉ qua service
// ============================================================

// POST /api/admin/ai-content/product-description
const generateProductDescription = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiContentService.generateProductDescription(req.body, (req as any).user.id);
  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/product-description-from-name
const generateProductDescriptionFromName = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiContentService.generateProductDescriptionFromName(req.body, (req as any).user.id);
  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/blog
const generateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiContentService.generateBlogPost(req.body, (req as any).user.id);
  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/analyze-seo
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

// POST /api/admin/ai-content/suggest-specifications
const suggestSpecifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiContentService.suggestSpecifications(req.body);
  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/ai-content/import-specifications
// Multer đã parse file trước khi vào đây — req.file đã sẵn sàng
const importSpecificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Không có file được upload" });
  }
  const { categoryId } = req.body;
  if (!categoryId) {
    return res.status(400).json({ success: false, message: "categoryId là bắt buộc" });
  }

  const result = await aiContentService.importSpecifications(req.file.buffer, req.file.originalname, categoryId);
  res.status(200).json({ success: true, data: result });
});

// GET /api/admin/ai-content/spec-template?categoryId=xxx
// Logic build XLSX đã chuyển sang service
const downloadSpecTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.query as { categoryId: string };

  if (!categoryId) {
    return res.status(400).json({ success: false, message: "categoryId là bắt buộc" });
  }

  const { buffer, filename } = await aiContentService.getSpecTemplate(categoryId);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
});

export const aiContentController = {
  generateProductDescription,
  generateProductDescriptionFromName,
  generateBlogPost,
  analyzeSEO,
  getHistory,
  suggestSpecifications,
  importSpecificationsHandler,
  downloadSpecTemplate,
};
