import { Router } from "express";
import { optionalAuthMiddleware } from "@/app/middlewares/auth.middleware";
import {
  getHomePageHandler,
  getFlashSaleSectionHandler,
  getBestSellingSectionHandler,
  getRecentlyViewedSectionHandler,
} from "./home.controller";

const router = Router();

/**
 * Get all home page data in ONE request
 * GET /api/home
 *
 * Returns:
 * - Featured Categories
 * - Sliders (HOME_TOP)
 * - Banners (BELOW_SLIDER, HOME_SECTION_1)
 * - Flash Sale Products
 * - Best Selling Products
 * - Latest Blogs
 *
 * Supports optional authentication for personalized pricing
 */
router.get("/", optionalAuthMiddleware, getHomePageHandler);

router.get("/flash-sale", optionalAuthMiddleware, getFlashSaleSectionHandler);

router.get("/best-selling", optionalAuthMiddleware, getBestSellingSectionHandler);

router.post("/recently-viewed", optionalAuthMiddleware, getRecentlyViewedSectionHandler);

export default router;
