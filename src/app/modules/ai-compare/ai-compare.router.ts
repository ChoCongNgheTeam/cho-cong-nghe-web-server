// ============================================================
// ai.route.ts
// Express router cho AI module
//
// Pattern giống product.route.ts:
//   validate middleware → asyncHandler → controller
// ============================================================

import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { aiCompareHandler } from "./ai-compare.controller";
import { aiCompareBodySchema } from "./ai-compare.validation";

const router = Router();

/**
 * POST /api/ai/compare
 *
 * So sánh 2-3 sản phẩm bằng AI.
 *
 * Body:
 * {
 *   "productIds": ["uuid1", "uuid2"]        // 2 sản phẩm
 *   "productIds": ["uuid1", "uuid2", "uuid3"] // hoặc 3 sản phẩm
 * }
 *
 * Response:
 * {
 *   "data": {
 *     "products": [...],    // metadata + highlightSpecs để render card
 *     "aiAnalysis": { summary, comparison, strengths, recommendation }
 *   },
 *   "message": "So sánh sản phẩm thành công"
 * }
 */
router.post(
  "/",
  validate(aiCompareBodySchema, "body"),
  asyncHandler(aiCompareHandler)
);

export default router;


// ============================================================
// Mount vào app.ts / main router
// ============================================================
//
// Trong file src/app/routes/index.ts hoặc app.ts, thêm:
//
//   import aiRoutes from "@/app/modules/ai/ai.route";
//   app.use("/api/ai", aiRoutes);
//
// Endpoint cuối cùng: POST /api/ai/compare