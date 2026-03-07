import { Request, Response } from "express";
import * as promotionService from "./promotion.service";
import { ListPromotionsQuery } from "./promotion.validation";

const paginatedResponse = (result: any, message: string) => ({
  data: result.data,
  pagination: {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  },
  message,
});

export const getPromotionsPublicHandler = async (req: Request, res: Response) => {
  const result = await promotionService.getPromotions(req.query as unknown as ListPromotionsQuery);
  res.json(paginatedResponse(result, "Lấy danh sách khuyến mãi thành công"));
};

export const getActivePromotionsHandler = async (req: Request, res: Response) => {
  const promotions = await promotionService.getActivePromotions();
  res.json({ data: promotions, message: "Lấy danh sách khuyến mãi đang hoạt động thành công" });
};

export const getPromotionsByProductHandler = async (req: Request, res: Response) => {
  const promotions = await promotionService.getActivePromotionsForProduct(req.params.productId);
  res.json({ data: promotions, message: "Lấy khuyến mãi cho sản phẩm thành công" });
};

export const getPromotionsByCategoryHandler = async (req: Request, res: Response) => {
  const promotions = await promotionService.getActivePromotionsForCategory(req.params.categoryId);
  res.json({ data: promotions, message: "Lấy khuyến mãi cho danh mục thành công" });
};

export const getPromotionsByBrandHandler = async (req: Request, res: Response) => {
  const promotions = await promotionService.getActivePromotionsForBrand(req.params.brandId);
  res.json({ data: promotions, message: "Lấy khuyến mãi cho thương hiệu thành công" });
};

export const getPromotionsAdminHandler = async (req: Request, res: Response) => {
  const result = await promotionService.getPromotions(req.query as unknown as ListPromotionsQuery);
  res.json(paginatedResponse(result, "Lấy danh sách khuyến mãi thành công"));
};

export const getPromotionByIdHandler = async (req: Request, res: Response) => {
  const promotion = await promotionService.getPromotionById(req.params.id);
  res.json({ data: promotion, message: "Lấy chi tiết khuyến mãi thành công" });
};

export const createPromotionHandler = async (req: Request, res: Response) => {
  const promotion = await promotionService.createPromotion(req.body);
  res.status(201).json({ data: promotion, message: "Tạo khuyến mãi thành công" });
};

export const updatePromotionHandler = async (req: Request, res: Response) => {
  const promotion = await promotionService.updatePromotion(req.params.id, req.body);
  res.json({ data: promotion, message: "Cập nhật khuyến mãi thành công" });
};

export const deletePromotionHandler = async (req: Request, res: Response) => {
  await promotionService.deletePromotion(req.params.id);
  res.json({ message: "Xóa khuyến mãi thành công" });
};
