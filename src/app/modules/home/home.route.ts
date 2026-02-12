import { Router } from "express";
import { optionalAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { getHomePageHandler, getFlashSaleSectionHandler, getBestSellingSectionHandler, getRecentlyViewedSectionHandler, getActiveCampaignsSectionHandler } from "./home.controller";

const router = Router();

/**
 * Get all home page data in ONE request
 * GET /api/home
 *
 * Returns:
 * - Sliders (HOME_TOP)
 * - Featured Categories
 * - Banners (BELOW_SLIDER, HOME_SECTION_1)
 * - Flash Sale Products
 * - Active Campaigns (NEW!)
 * - Featured Products
 * - Best Selling Products
 * - Latest Blogs
 *
 * Supports optional authentication for personalized pricing
 */
router.get("/", optionalAuthMiddleware, getHomePageHandler);

/**
 * Get Flash Sale section only
 * GET /api/home/flash-sale?date=2026-02-12
 *
 * Query params:
 * - date (optional): ISO date string for specific flash sale date
 */
router.get("/flash-sale", optionalAuthMiddleware, getFlashSaleSectionHandler);

/**
 * Get Best Selling section only
 * GET /api/home/best-selling?limit=12
 *
 * Query params:
 * - limit (optional): Number of products to return (default: 12)
 */
router.get("/best-selling", optionalAuthMiddleware, getBestSellingSectionHandler);

/**
 * NEW: Get Active Campaigns section only
 * GET /api/home/campaigns
 *
 * Returns active campaigns with categories for home page display
 * Useful for lazy loading or refreshing campaigns without full page reload
 */
router.get("/campaigns", getActiveCampaignsSectionHandler);

/**
 * Get Recently Viewed section
 * POST /api/home/recently-viewed
 *
 * Body:
 * {
 *   "productIds": ["uuid1", "uuid2", "uuid3"]
 * }
 */
router.post("/recently-viewed", optionalAuthMiddleware, getRecentlyViewedSectionHandler);

export default router;
