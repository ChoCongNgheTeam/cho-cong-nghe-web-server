import { Request, Response } from "express";
import * as homeService from "./home.service";
import { getRecentlyViewedSection } from "./home.service";

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

export const getRecentlyViewedSectionHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.json({
      products: [],
    });
  }

  const products = await getRecentlyViewedSection(productIds, userId);

  return res.json({
    products,
  });
};
