import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./recommendation.controller";
import {
  similarProductsQuerySchema,
  forYouQuerySchema,
  trackViewEventSchema,
  trackRecommendationClickSchema,
  recommendationAnalyticsQuerySchema,
  recentlyViewedQuerySchema,
} from "./recommendation.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

// Public — không bắt buộc đăng nhập. authMiddleware(false) chỉ gắn req.user nếu có token hợp lệ,
// không chặn nếu không có (khách vãng lai vẫn xem được gợi ý, dùng sessionId để cá nhân hoá nhẹ).
router.use(authMiddleware(false));

router.get("/similar/:productId", validate(similarProductsQuerySchema, "query"), asyncHandler(c.getSimilarProductsHandler));
router.get("/bought-together/:productId", validate(similarProductsQuerySchema, "query"), asyncHandler(c.getBoughtTogetherProductsHandler));
router.get("/for-you", validate(forYouQuerySchema, "query"), asyncHandler(c.getForYouHandler));
router.get("/recently-viewed", validate(recentlyViewedQuerySchema, "query"), asyncHandler(c.getRecentlyViewedHandler));

router.post("/view-event", validate(trackViewEventSchema, "body"), asyncHandler(c.trackViewEventHandler));
router.post("/click", validate(trackRecommendationClickSchema, "body"), asyncHandler(c.trackRecommendationClickHandler));

// ================== ADMIN ==================
// Route riêng, yêu cầu auth thật + role (khác với authMiddleware(false) ở trên
// chỉ optional cho các route công khai).
router.use("/admin", authMiddleware(true), requireRole(...STAFF_ROLES, "ADMIN"));
router.get("/admin/analytics", validate(recommendationAnalyticsQuerySchema, "query"), asyncHandler(c.getAnalyticsHandler));

export default router;
