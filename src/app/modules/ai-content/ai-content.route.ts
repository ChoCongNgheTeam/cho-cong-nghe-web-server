import { Router, Request, Response, NextFunction } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { aiContentController } from "./ai-content.controller";
import { generateProductDescriptionSchema, generateProductDescriptionFromNameSchema, generateBlogPostSchema, analyzeSEOSchema, contentHistorySchema } from "./ai-content.validation";

// ============================================================
// AI CONTENT ROUTES — Admin only
// Base: /api/admin/ai-content
// ============================================================

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN", "STAFF")] as const;

// ─── Timeout middleware riêng cho AI routes ──────────────────
// Express/Node mặc định không có timeout — nếu server chạy sau
// nginx/proxy thì proxy sẽ cut connection trước khi AI xong.
// Middleware này set socket timeout dài hơn cho đúng route.
const extendTimeout = (timeoutMs = 180_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Tăng socket timeout để tránh proxy/nginx ngắt sớm
    req.socket.setTimeout(timeoutMs);

    // Gửi header sớm để proxy biết connection vẫn sống
    // (một số proxy như nginx dùng proxy_read_timeout để đo từ lúc nhận header cuối)
    res.setHeader("X-Accel-Buffering", "no"); // tắt nginx buffering

    next();
  };
};

// Viết mô tả sản phẩm (sản phẩm đã tồn tại trong DB)
router.post("/product-description", ...adminAuth, extendTimeout(), validate(generateProductDescriptionSchema), asyncHandler(aiContentController.generateProductDescription));

// Viết mô tả sản phẩm (sản phẩm MỚI, chỉ có tên + keyword)
router.post("/product-description-from-name", ...adminAuth, extendTimeout(), validate(generateProductDescriptionFromNameSchema), asyncHandler(aiContentController.generateProductDescriptionFromName));

// Viết bài blog
router.post("/blog", ...adminAuth, extendTimeout(), validate(generateBlogPostSchema), asyncHandler(aiContentController.generateBlogPost));

// Check SEO — không gọi AI, không cần timeout dài
router.post("/analyze-seo", ...adminAuth, validate(analyzeSEOSchema), asyncHandler(aiContentController.analyzeSEO));

// Lịch sử nội dung đã tạo
router.get("/history", ...adminAuth, validate(contentHistorySchema, "query"), asyncHandler(aiContentController.getHistory));

export const aiContentRoute = router;
