import { Request, Response } from "express";
import * as promotionService from "./promotion.service";
import { ListPromotionsQuery, ListDeletedPromotionsQuery, BulkDeletePromotionInput } from "./promotion.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

// =====================
// === PUBLIC ===
// =====================

export const getPromotionsPublicHandler = async (req: Request, res: Response) => {
  // Đã validate ở route middleware (validate(listPromotionsSchema, "query")) — chỉ cast type ở đây.
  const query = req.query as unknown as ListPromotionsQuery;
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
  // Đã validate ở route middleware — chỉ cast type ở đây.
  const query = req.query as unknown as ListPromotionsQuery;
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
  // Route /admin/:id đã gate bằng requireRole(...STAFF_ROLES, "ADMIN") + requirePermission("canPromotions"),
  // nên staff thuộc STAFF_ROLES đã qua được middleware cũng cần nhận đủ field admin, không chỉ role === "ADMIN".
  const role = req.user!.role;
  const isAdmin = role === "ADMIN" || STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]);
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
  // Đã validate ở route middleware (validate(listDeletedPromotionsSchema, "query")) — chỉ cast type ở đây.
  const query = req.query as unknown as ListDeletedPromotionsQuery;
  const result = await promotionService.getDeletedPromotions(query);
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

export const bulkDeletePromotionHandler = async (req: Request, res: Response) => {
  const { ids } = req.body as BulkDeletePromotionInput;
  const result = await promotionService.bulkSoftDeletePromotion(ids, req.user!.id);
  res.json({ data: result, message: `Đã xóa ${result.deletedCount} khuyến mãi thành công` });
};
