import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./recommendation.controller";
import {
  similarProductsQuerySchema,
  forYouQuerySchema,
  trackViewEventSchema,
  trackRecommendationClickSchema,
} from "./recommendation.validation";

const router = Router();

// Public — không bắt buộc đăng nhập. authMiddleware(false) chỉ gắn req.user nếu có token hợp lệ,
// không chặn nếu không có (khách vãng lai vẫn xem được gợi ý, dùng sessionId để cá nhân hoá nhẹ).
router.use(authMiddleware(false));

router.get("/similar/:productId", validate(similarProductsQuerySchema, "query"), asyncHandler(c.getSimilarProductsHandler));
router.get("/bought-together/:productId", validate(similarProductsQuerySchema, "query"), asyncHandler(c.getBoughtTogetherProductsHandler));
router.get("/for-you", validate(forYouQuerySchema, "query"), asyncHandler(c.getForYouHandler));

router.post("/view-event", validate(trackViewEventSchema, "body"), asyncHandler(c.trackViewEventHandler));
router.post("/click", validate(trackRecommendationClickSchema, "body"), asyncHandler(c.trackRecommendationClickHandler));

export default router;
