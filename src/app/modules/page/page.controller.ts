import { Request, Response } from "express";
import * as pageService from "./page.service";

export const getPageBySlugHandler = async (req: Request, res: Response) => {
  // Tham số req.params.slug đã được validate thành công ở middleware
  const { slug } = req.params;
  
  const page = await pageService.getPageBySlugPublic(slug);

  res.json({
    data: page,
    message: "Lấy thông tin trang thành công",
  });
};