import { Router } from "express";
import { optionalAuthMiddleware } from "@/app/middlewares/auth.middleware";
import {
  getHomePageHandler,
  getFlashSaleSectionHandler,
  getBestSellingSectionHandler,
  // getFeaturedSectionHandler,
} from "./home.controller";

const router = Router();

/**
 * Get all home page data in ONE request
 * GET /api/home
 *
 * Returns:
 * - Sliders (HOME_TOP)
 * - Banners (BELOW_SLIDER, HOME_SECTION_1)
 * - Flash Sale Products
 * - Sale Categories
 * - Best Selling Products
 * - Featured Products by Categories
 * - Latest Blogs
 * - Featured Categories
 *
 * Supports optional authentication for personalized pricing
 */
router.get("/", optionalAuthMiddleware, getHomePageHandler);

/**
 * Optional endpoints for lazy loading or refreshing individual sections
 */

/**
 * Get Flash Sale section only
 * GET /api/home/flash-sale?date=2026-01-27
 */
router.get("/flash-sale", optionalAuthMiddleware, getFlashSaleSectionHandler);

/**
 * Get Best Selling section only
 * GET /api/home/best-selling?limit=12
 */
router.get("/best-selling", optionalAuthMiddleware, getBestSellingSectionHandler);

/**
 * Get Featured Products section only
 * GET /api/home/featured?limit=8&categoriesLimit=6
 */
// router.get("/featured", optionalAuthMiddleware, getFeaturedSectionHandler);

export default router;
