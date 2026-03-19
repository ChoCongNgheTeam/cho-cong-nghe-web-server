import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import {
  getHomePageHandler,
  // getFlashSaleSectionHandler,
  getBestSellingSectionHandler,
  getRecentlyViewedSectionHandler,
  getActiveCampaignsSectionHandler,
  getSaleScheduleSectionHandler,
  getProductsByDateSectionHandler,
} from "./home.controller";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// ── Main ──────────────────────────────────────────────────────────────────────
router.get("/", authMiddleware(false), asyncHandler(getHomePageHandler));

// ── Flash Sale ────────────────────────────────────────────────────────────────
// Endpoint cũ — giữ backward compat
// router.get("/flash-sale", authMiddleware(false), asyncHandler(getFlashSaleSectionHandler));

// [NEW] Lịch sale 7 ngày + products hôm nay (không cần auth)
router.get("/sale-schedule", asyncHandler(getSaleScheduleSectionHandler));

// [NEW] Products sale theo ngày click (không cần auth)
// ?date=2026-03-19&promotionId=xxx&page=1&limit=20
router.get("/sale-by-date", authMiddleware(false), asyncHandler(getProductsByDateSectionHandler));

// ── Other sections ────────────────────────────────────────────────────────────
router.get("/best-selling", authMiddleware(false), asyncHandler(getBestSellingSectionHandler));
router.get("/campaigns", asyncHandler(getActiveCampaignsSectionHandler));
router.post("/recently-viewed", authMiddleware(false), asyncHandler(getRecentlyViewedSectionHandler));

export default router;
