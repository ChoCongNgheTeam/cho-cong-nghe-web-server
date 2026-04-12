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

// ─── Timeout middleware cho AI routes ────────────────────────
const extendTimeout = (timeoutMs = 180_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.socket.setTimeout(timeoutMs);
    res.setHeader("X-Accel-Buffering", "no");
    next();
  };
};

// ─── Standard routes ─────────────────────────────────────────

router.get("/spec-template", ...adminAuth, asyncHandler(aiContentController.downloadSpecTemplate));

router.post("/product-description", ...adminAuth, extendTimeout(), validate(generateProductDescriptionSchema), asyncHandler(aiContentController.generateProductDescription));

router.post("/product-description-from-name", ...adminAuth, extendTimeout(), validate(generateProductDescriptionFromNameSchema), asyncHandler(aiContentController.generateProductDescriptionFromName));

router.post("/blog", ...adminAuth, extendTimeout(), validate(generateBlogPostSchema), asyncHandler(aiContentController.generateBlogPost));

router.post("/analyze-seo", ...adminAuth, validate(analyzeSEOSchema), asyncHandler(aiContentController.analyzeSEO));

router.get("/history", ...adminAuth, validate(contentHistorySchema, "query"), asyncHandler(aiContentController.getHistory));

router.post("/suggest-specifications", ...adminAuth, extendTimeout(60_000), validate(suggestSpecificationsSchema), asyncHandler(aiContentController.suggestSpecifications));

// ─── Import Specifications — multipart/form-data ─────────────
//
// FIX LỖI "Multipart: Boundary not found":
// Nguyên nhân: express.json() (global middleware) consume request
// stream TRƯỚC khi multer chạy. Một stream chỉ đọc được 1 lần —
// multer không còn gì để đọc → không tìm thấy multipart boundary.
//
// Giải pháp: đặt uploadSpec.single("file") LÀ MIDDLEWARE ĐẦU TIÊN
// của route này, TRƯỚC cả authMiddleware. Auth vẫn chạy sau đó,
// nhưng lúc này body đã được multer parse xong và không bị conflict.
//
// Lưu ý: req.body (categoryId) sau multer vẫn đọc được vì multer
// tự parse các text fields trong multipart form.
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

export const aiContentRoute = router;
