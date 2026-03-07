import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { getHomePageHandler, getFlashSaleSectionHandler, getBestSellingSectionHandler, getRecentlyViewedSectionHandler, getActiveCampaignsSectionHandler } from "./home.controller";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.get("/", authMiddleware(false), asyncHandler(getHomePageHandler));
router.get("/flash-sale", authMiddleware(false), asyncHandler(getFlashSaleSectionHandler));
router.get("/best-selling", authMiddleware(false), asyncHandler(getBestSellingSectionHandler));
router.get("/campaigns", asyncHandler(getActiveCampaignsSectionHandler));
router.post("/recently-viewed", authMiddleware(false), asyncHandler(getRecentlyViewedSectionHandler));

export default router;
