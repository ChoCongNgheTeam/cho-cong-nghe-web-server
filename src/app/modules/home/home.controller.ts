import { Request, Response } from "express";
import * as homeService from "./home.service";

export const getHomePageHandler = async (req: Request, res: Response) => {
  const homeData = await homeService.getHomePageData(req.user?.id);
  res.json({ data: homeData, message: "Lấy dữ liệu trang chủ thành công" });
};

export const getFlashSaleSectionHandler = async (req: Request, res: Response) => {
  const date = req.query.date ? new Date(req.query.date as string) : undefined;
  const result = await homeService.getFlashSaleSection(req.user?.id, date);
  res.json({ data: result, message: "Lấy sản phẩm flash sale thành công" });
};

export const getBestSellingSectionHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
  const products = await homeService.getBestSellingSection(req.user?.id, limit);
  res.json({ data: products, total: products.length, message: "Lấy sản phẩm bán chạy thành công" });
};

export const getRecentlyViewedSectionHandler = async (req: Request, res: Response) => {
  const { productIds } = req.body;

  // Early return với empty array — không phải lỗi, không cần throw
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
