import { Router } from "express";

import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getHomeStaticHandler, getHomeProductsHandler, getHomeSaleScheduleHandler, getProductsByDateSectionHandler } from "./home.controller";
import { getSaleByDateSchema } from "./home.validation";

const router = Router();

/**
 * GET /home/static
 * Banners + categories + campaigns + blogs.
 * Public — không cần auth, FE cache 1 giờ.
 */
router.get("/static", asyncHandler(getHomeStaticHandler));

/**
 * GET /home/products
 * Featured products + best selling.
 * Optional auth để personalize giá, FE cache 5 phút.
 */
router.get("/products", authMiddleware(false), asyncHandler(getHomeProductsHandler));

/**
 * GET /home/sale-schedule
 * Lịch sale 3 ngày + sản phẩm hôm nay.
 * Optional auth để personalize giá, FE cache 60 giây.
 */
router.get("/sale-schedule", authMiddleware(false), asyncHandler(getHomeSaleScheduleHandler));

/**
 * GET /home/sale-by-date?date=YYYY-MM-DD&page=1&limit=20
 * Sản phẩm sale theo ngày cụ thể — không cache (dynamic param).
 */
router.get("/sale-by-date", authMiddleware(false), validate(getSaleByDateSchema, "query"), asyncHandler(getProductsByDateSectionHandler));

export default router;
