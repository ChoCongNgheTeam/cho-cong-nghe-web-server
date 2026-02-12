/**
 * Home Module
 *
 * Orchestrator module for Home page data
 * Aggregates data from multiple modules:
 * - image-media (sliders, banners)
 * - category (featured categories)
 * - campaign (active campaigns with categories) ⭐ NEW
 * - product (flash sale, best selling, featured)
 * - blog (latest blogs)
 *
 * Main endpoint: GET /api/home
 * Returns all data needed for Home page in ONE request
 *
 * Changes in this version:
 * - ✅ Removed categoryRanking (product-based ranking)
 * - ✅ Added activeCampaigns (campaign-based sections)
 * - ✅ Support multiple campaigns display (2-3 campaigns)
 * - ✅ Dynamic campaign filtering by date and type
 * - ✅ New endpoint: GET /api/home/campaigns
 */

export { default as homeRoutes } from "./home.route";
export * from "./home.service";
export * from "./home.controller";
export * from "./home.types";
