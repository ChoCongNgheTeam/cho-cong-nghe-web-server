import { Request, Response } from "express";
import * as homeService from "./home.service";

export const getHomePageHandler = async (req: Request, res: Response) => {
  const homeData = await homeService.getHomePageData(req.user?.id);
  res.json({ data: homeData, message: "Lấy dữ liệu trang chủ thành công" });
};

// export const getFlashSaleSectionHandler = async (req: Request, res: Response) => {
//   const date = req.query.date ? new Date(req.query.date as string) : undefined;
//   const result = await homeService.getFlashSaleSection(req.user?.id, date);
//   res.json({ data: result, message: "Lấy sản phẩm flash sale thành công" });
// };

export const getBestSellingSectionHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
  const products = await homeService.getBestSellingSection(req.user?.id, limit);
  res.json({ data: products, total: products.length, message: "Lấy sản phẩm bán chạy thành công" });
};

export const getRecentlyViewedSectionHandler = async (req: Request, res: Response) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.json({ data: [], message: "Danh sách sản phẩm rỗng" });
  }
  const products = await homeService.getRecentlyViewedSection(productIds, req.user?.id);
  res.json({ data: products, message: "Lấy sản phẩm đã xem thành công" });
};

export const getActiveCampaignsSectionHandler = async (req: Request, res: Response) => {
  const campaigns = await homeService.getActiveCampaignsSection();
  res.json({ data: campaigns, total: campaigns.length, message: "Lấy danh sách chiến dịch thành công" });
};

/**
 * GET /home/sale-schedule
 *
 * Lịch sale 7 ngày + products hôm nay (load sẵn tab đầu).
 * FE dùng để render calendar tabs trong Flash Sale section.
 */
export const getSaleScheduleSectionHandler = async (req: Request, res: Response) => {
  const result = await homeService.getSaleScheduleSection();
  res.json({ data: result, message: "Lấy lịch sale thành công" });
};

/**
 * GET /home/sale-by-date?date=2026-03-19&promotionId=xxx&page=1&limit=20
 *
 * Products sale theo ngày cụ thể.
 * FE gọi khi user click vào tab ngày khác hôm nay trong Flash Sale section.
 */
export const getProductsByDateSectionHandler = async (req: Request, res: Response) => {
  const dateStr = req.query.date as string;
  if (!dateStr || isNaN(Date.parse(dateStr))) {
    return res.status(400).json({ message: "date không hợp lệ (format: YYYY-MM-DD)" });
  }

  const date = new Date(dateStr);
  const promotionId = req.query.promotionId as string | undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;

  const result = await homeService.getProductsByDateSection(date, { promotionId, page, limit }, req.user?.id);

  res.json({ data: result, message: "Lấy sản phẩm sale thành công" });
};
