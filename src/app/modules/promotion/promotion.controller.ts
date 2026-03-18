import { Request, Response } from "express";
import * as promotionService from "./promotion.service";
import { listPromotionsSchema } from "./promotion.validation";

// =====================
// === PUBLIC ===
// =====================

export const getPromotionsPublicHandler = async (req: Request, res: Response) => {
  const query = listPromotionsSchema.parse(req.query);
  const result = await promotionService.getPromotionsPublic(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách khuyến mãi thành công",
  });
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

// =====================
// === ADMIN: list, detail ===
// =====================

export const getPromotionsAdminHandler = async (req: Request, res: Response) => {
  const query = listPromotionsSchema.parse(req.query);
  const result = await promotionService.getPromotionsAdmin(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      statusCounts: result.statusCounts,
    },
    message: "Lấy danh sách khuyến mãi thành công",
  });
};

export const getPromotionDetailHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const promotion = await promotionService.getPromotionDetail(req.params.id, { isAdmin });
  res.json({ data: promotion, message: "Lấy chi tiết khuyến mãi thành công" });
};

// =====================
// === ADMIN: create, update ===
// =====================

export const createPromotionHandler = async (req: Request, res: Response) => {
  const promotion = await promotionService.createPromotion(req.body);
  res.status(201).json({ data: promotion, message: "Tạo khuyến mãi thành công" });
};

export const updatePromotionHandler = async (req: Request, res: Response) => {
  const promotion = await promotionService.updatePromotion(req.params.id, req.body);
  res.json({ data: promotion, message: "Cập nhật khuyến mãi thành công" });
};

// =====================
// === ADMIN: soft delete, restore, hard delete, trash ===
// =====================

export const deletePromotionHandler = async (req: Request, res: Response) => {
  await promotionService.softDeletePromotion(req.params.id, req.user!.id);
  res.json({ message: "Xóa khuyến mãi thành công" });
};

export const restorePromotionHandler = async (req: Request, res: Response) => {
  const promotion = await promotionService.restorePromotion(req.params.id);
  res.json({ data: promotion, message: "Khôi phục khuyến mãi thành công" });
};

export const hardDeletePromotionHandler = async (req: Request, res: Response) => {
  await promotionService.hardDeletePromotion(req.params.id);
  res.json({ message: "Xóa vĩnh viễn khuyến mãi thành công" });
};

export const getDeletedPromotionsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await promotionService.getDeletedPromotions({ page, limit });
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
    message: "Lấy danh sách khuyến mãi đã xóa thành công",
  });
};
