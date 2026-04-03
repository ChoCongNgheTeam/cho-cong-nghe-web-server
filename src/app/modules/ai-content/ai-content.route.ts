import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { aiContentController } from "./ai-content.controller";
import { generateProductDescriptionSchema, generateBlogPostSchema, analyzeSEOSchema, contentHistorySchema } from "./ai-content.validation";

// ============================================================
// AI CONTENT ROUTES — Admin only
// Base: /api/admin/ai-content
// ============================================================

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN", "STAFF")] as const;

// Viết mô tả sản phẩm
router.post("/product-description", ...adminAuth, validate(generateProductDescriptionSchema), asyncHandler(aiContentController.generateProductDescription));

// Viết bài blog
router.post("/blog", ...adminAuth, validate(generateBlogPostSchema), asyncHandler(aiContentController.generateBlogPost));

// Check SEO (không gọi AI, nhanh, miễn phí)
router.post("/analyze-seo", ...adminAuth, validate(analyzeSEOSchema), asyncHandler(aiContentController.analyzeSEO));

// Lịch sử nội dung đã tạo
router.get("/history", ...adminAuth, validate(contentHistorySchema, "query"), asyncHandler(aiContentController.getHistory));

export const aiContentRoute = router;
