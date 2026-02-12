import { Request, Response } from "express";
import * as homeService from "./home.service";

export const getHomePageHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const homeData = await homeService.getHomePageData(userId);

    res.json({
      success: true,
      data: homeData,
      message: "Lấy dữ liệu trang chủ thành công",
    });
  } catch (error: any) {
    console.error("Error in getHomePageHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get Flash Sale section only
 * GET /api/home/flash-sale?date=2026-01-27
 */
export const getFlashSaleSectionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : undefined;

    const result = await homeService.getFlashSaleSection(userId, date);

    res.json({
      success: true,
      data: result,
      message: "Lấy sản phẩm flash sale thành công",
    });
  } catch (error: any) {
    console.error("Error in getFlashSaleSectionHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get Best Selling section only
 * GET /api/home/best-selling?limit=12
 */
export const getBestSellingSectionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

    const products = await homeService.getBestSellingSection(userId, limit);

    res.json({
      success: true,
      data: products,
      total: products.length,
      message: "Lấy sản phẩm bán chạy thành công",
    });
  } catch (error: any) {
    console.error("Error in getBestSellingSectionHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get Recently Viewed section
 * POST /api/home/recently-viewed
 * Body: { productIds: ["uuid1", "uuid2", ...] }
 */
export const getRecentlyViewedSectionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "Danh sách sản phẩm rỗng",
      });
    }

    const products = await homeService.getRecentlyViewedSection(productIds, userId);

    res.json({
      success: true,
      data: products,
      message: "Lấy sản phẩm đã xem thành công",
    });
  } catch (error: any) {
    console.error("Error in getRecentlyViewedSectionHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * NEW: Get Active Campaigns section only
 * GET /api/home/campaigns
 *
 * Returns active campaigns that are:
 * - Currently valid (within date range)
 * - Have categories attached
 * - Type: CAMPAIGN, SEASONAL, or EVENT
 */
export const getActiveCampaignsSectionHandler = async (req: Request, res: Response) => {
  try {
    const campaigns = await homeService.getActiveCampaignsSection();

    res.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
      message: "Lấy danh sách chiến dịch thành công",
    });
  } catch (error: any) {
    console.error("Error in getActiveCampaignsSectionHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
