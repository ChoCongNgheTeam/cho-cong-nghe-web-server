import { Request, Response } from "express";
import * as homeService from "./home.service";

export const getHomePageHandler = async (req: Request, res: Response) => {
  const homeData = await homeService.getHomePageData(req.user?.id);
  res.json({ data: homeData, message: "Lấy dữ liệu trang chủ thành công" });
};

export const getProductsByDateSectionHandler = async (req: Request, res: Response) => {
  const { date, promotionId, page, limit } = req.query as any;
  const result = await homeService.getProductsByDateSection(new Date(date), { promotionId, page, limit }, req.user?.id);
  res.json({ data: result, message: "Lấy sản phẩm sale thành công" });
};
