import { Router, Request, Response, NextFunction } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { aiContentController } from "./ai-content.controller";
import {
  generateProductDescriptionSchema,
  generateProductDescriptionFromNameSchema,
  generateBlogPostSchema,
  analyzeSEOSchema,
  contentHistorySchema,
  suggestSpecificationsSchema,
} from "./ai-content.validation";
import { uploadSpec } from "./ai-content.service";

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

router.get("/spec-template", ...adminAuth, asyncHandler(aiContentController.downloadSpecTemplate));

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

// extendTimeout(60_000) → extendTimeout(120_000)
// Lý do: 55 specs / 20 per chunk = 3 chunks chạy song song
// Mỗi chunk ~15-20s → worst case ~25s, nhưng thêm buffer an toàn

router.post(
  "/suggest-specifications",
  ...adminAuth,
  extendTimeout(120_000), // tăng từ 60s lên 120s
  validate(suggestSpecificationsSchema),
  asyncHandler(aiContentController.suggestSpecifications),
);

router.post(
  "/import-specifications",
  ...adminAuth,
  uploadSpec.single("file"), // field name = "file"
  asyncHandler(aiContentController.importSpecificationsHandler),
);

export const aiContentRoute = router;
