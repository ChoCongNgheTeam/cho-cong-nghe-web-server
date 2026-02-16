import { Request, Response } from "express";
import * as promotionService from "./promotion.service";
import { ListPromotionsQuery } from "./promotion.validation";

type ValidatedQuery<T> = Request & {
  query: T;
};

// =====================
// === PUBLIC HANDLERS ===
// =====================

export const getPromotionsPublicHandler = async (req: ValidatedQuery<ListPromotionsQuery>, res: Response) => {
  try {
    const result = await promotionService.getPromotions(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách khuyến mãi thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getActivePromotionsHandler = async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getActivePromotions();

    res.json({
      success: true,
      data: promotions,
      message: "Lấy danh sách khuyến mãi đang hoạt động thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getPromotionsByProductHandler = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const promotions = await promotionService.getActivePromotionsForProduct(productId);

    res.json({
      success: true,
      data: promotions,
      message: "Lấy khuyến mãi cho sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getPromotionsByCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const promotions = await promotionService.getActivePromotionsForCategory(categoryId);

    res.json({
      success: true,
      data: promotions,
      message: "Lấy khuyến mãi cho danh mục thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getPromotionsByBrandHandler = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const promotions = await promotionService.getActivePromotionsForBrand(brandId);

    res.json({
      success: true,
      data: promotions,
      message: "Lấy khuyến mãi cho thương hiệu thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// =====================
// === ADMIN HANDLERS ===
// =====================

export const getPromotionsAdminHandler = async (req: ValidatedQuery<ListPromotionsQuery>, res: Response) => {
  try {
    const result = await promotionService.getPromotions(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách khuyến mãi thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getPromotionByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = await promotionService.getPromotionById(id);

    res.json({
      success: true,
      data: promotion,
      message: "Lấy chi tiết khuyến mãi thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const createPromotionHandler = async (req: Request, res: Response) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);

    res.status(201).json({
      success: true,
      data: promotion,
      message: "Tạo khuyến mãi thành công",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const updatePromotionHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = await promotionService.updatePromotion(id, req.body);

    res.json({
      success: true,
      data: promotion,
      message: "Cập nhật khuyến mãi thành công",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const deletePromotionHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await promotionService.deletePromotion(id);

    res.json({
      success: true,
      message: "Xóa khuyến mãi thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
