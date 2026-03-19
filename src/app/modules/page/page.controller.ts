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
export const getPagesPublicHandler = async (req: Request, res: Response) => {
  // req.query đã được làm sạch bởi middleware validate
  const query = req.query as any; 
  
  const pages = await pageService.getPagesPublic(query);

  res.json({
    data: pages,
    message: "Lấy danh sách trang thành công",
  });
};

export const getPagesAdminHandler = async (req: Request, res: Response) => {
  const result = await pageService.getPagesAdmin(req.query as any);
  res.json({
    data: result.pages,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
    message: "Lấy danh sách trang (Admin) thành công",
  });
};

export const getPageDetailAdminHandler = async (req: Request, res: Response) => {
  const page = await pageService.getPageDetailAdmin(req.params.id);
  res.json({ data: page, message: "Lấy chi tiết trang thành công" });
};

export const createPageHandler = async (req: Request, res: Response) => {
  const page = await pageService.createPage(req.body);
  res.status(201).json({ data: page, message: "Tạo trang thành công" });
};

export const updatePageHandler = async (req: Request, res: Response) => {
  const page = await pageService.updatePage(req.params.id, req.body);
  res.json({ data: page, message: "Cập nhật trang thành công" });
};

export const deletePageHandler = async (req: Request, res: Response) => {
  await pageService.softDeletePage(req.params.id, req.user!.id);
  res.json({ message: "Xóa trang thành công" });
};

// BỔ SUNG: Các Handler mới
export const getTrashAdminHandler = async (req: Request, res: Response) => {
  const result = await pageService.getTrashAdmin(req.query as any);
  res.json({
    data: result.pages,
    pagination: {
      page: result.page, limit: result.limit, 
      total: result.total, totalPages: Math.ceil(result.total / result.limit)
    },
    message: "Lấy danh sách thùng rác thành công"
  });
};

export const restorePageHandler = async (req: Request, res: Response) => {
  await pageService.restorePage(req.params.id);
  res.json({ message: "Khôi phục trang thành công" });
};

export const hardDeletePageHandler = async (req: Request, res: Response) => {
  await pageService.hardDeletePage(req.params.id);
  res.json({ message: "Đã xóa vĩnh viễn trang tĩnh" });
};

export const changePageStatusHandler = async (req: Request, res: Response) => {
  await pageService.changePageStatus(req.params.id, req.body.isPublished);
  res.json({ message: "Cập nhật trạng thái hiển thị thành công" });
};