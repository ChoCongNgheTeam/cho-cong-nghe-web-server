/**
 * Home Module
 *
 * Orchestrator module for Home page data
 * Tổng hợp tất cả data từ các module khác:
 * - image-media (sliders, banners)
 * - category (featured categories, sale categories)
 * - product (flash sale, best selling, featured by categories)
 * - blog (latest blogs)
 *
 * Main endpoint: GET /api/home
 * Trả về tất cả data cần thiết cho trang Home trong 1 request duy nhất
 */

export { default as homeRoutes } from "./home.route";
export * from "./home.service";
export * from "./home.controller";
export * from "./home.types";
