import { Request, Response } from "express";

import { getHomeStaticData, getHomeProductsData, getHomeSaleScheduleData, getHomeCategoryProductsData, getProductsByDateSection } from "./home.service";
import { GetSaleByDateQuery } from "./home.validation";

/**
 * GET /home/static
 * Public — không cần userId.
 */
export const getHomeStaticHandler = async (_req: Request, res: Response): Promise<void> => {
  const data = await getHomeStaticData();
  res.json({ data, message: "Lấy dữ liệu tĩnh trang chủ thành công" });
};

/**
 * GET /home/products
 * Optional auth — userId để personalize giá.
 */
export const getHomeProductsHandler = async (req: Request, res: Response): Promise<void> => {
  const data = await getHomeProductsData(req.user?.id);
  res.json({ data, message: "Lấy sản phẩm trang chủ thành công" });
};

/**
 * GET /home/category-products
 * Optional auth — userId để personalize giá.
 */
export const getHomeCategoryProductsHandler = async (req: Request, res: Response): Promise<void> => {
  const data = await getHomeCategoryProductsData(req.user?.id);
  res.json({ data, message: "Lấy sản phẩm theo category thành công" });
};

/**
 * GET /home/sale-schedule
 * Optional auth — userId để personalize giá.
 */
export const getHomeSaleScheduleHandler = async (req: Request, res: Response): Promise<void> => {
  const data = await getHomeSaleScheduleData(req.user?.id);
  res.json({ data, message: "Lấy lịch sale thành công" });
};

/**
 * GET /home/sale-by-date?date=YYYY-MM-DD&page=1&limit=20
 * Query đã được validate + coerce bởi middleware.
 */
export const getProductsByDateSectionHandler = async (req: Request, res: Response): Promise<void> => {
  const { date, promotionId, page, limit } = req.query as unknown as GetSaleByDateQuery;

  const result = await getProductsByDateSection(new Date(`${date}T00:00:00+07:00`), { promotionId, page, limit }, req.user?.id);

  res.json({ data: result, message: "Lấy sản phẩm sale thành công" });
};
