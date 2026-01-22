import * as repo from "./promotion.repository";
import {
  CreatePromotionInput,
  UpdatePromotionInput,
  ListPromotionsQuery,
} from "./promotion.validation";
import { transformPromotionCard, transformPromotionDetail } from "./promotion.transformers";

// =====================
// === PUBLIC SERVICES ===
// =====================

export const getPromotions = async (query: ListPromotionsQuery) => {
  const result = await repo.findAll(query);

  return {
    ...result,
    data: result.data.map(transformPromotionCard),
  };
};

export const getActivePromotions = async () => {
  const promotions = await repo.findActivePromotions();
  return promotions.map(transformPromotionDetail);
};

export const getActivePromotionsForProduct = async (productId: string) => {
  const promotions = await repo.findActivePromotionsForProduct(productId);
  return promotions.map(transformPromotionDetail);
};

export const getActivePromotionsForCategory = async (categoryId: string) => {
  const promotions = await repo.findActivePromotionsForCategory(categoryId);
  return promotions.map(transformPromotionDetail);
};

export const getActivePromotionsForBrand = async (brandId: string) => {
  const promotions = await repo.findActivePromotionsForBrand(brandId);
  return promotions.map(transformPromotionDetail);
};

// =====================
// === ADMIN SERVICES ===
// =====================

export const getPromotionById = async (id: string) => {
  const promotion = await repo.findById(id);

  if (!promotion) {
    const error: any = new Error("Không tìm thấy promotion");
    error.statusCode = 404;
    throw error;
  }

  return transformPromotionDetail(promotion);
};

export const createPromotion = async (input: CreatePromotionInput) => {
  // Check if name already exists
  const exists = await repo.checkPromotionName(input.name);
  if (exists) {
    const error: any = new Error("Tên promotion đã tồn tại");
    error.statusCode = 400;
    throw error;
  }

  const promotion = await repo.create(input);
  return transformPromotionDetail(promotion);
};

export const updatePromotion = async (id: string, input: UpdatePromotionInput) => {
  // Check promotion exists
  await getPromotionById(id);

  // If updating name, check if new name exists
  if (input.name) {
    const currentPromotion = await repo.findById(id);
    if (currentPromotion && input.name !== currentPromotion.name) {
      const exists = await repo.checkPromotionName(input.name);
      if (exists) {
        const error: any = new Error("Tên promotion đã tồn tại");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  const promotion = await repo.update(id, input);
  return transformPromotionDetail(promotion);
};

export const deletePromotion = async (id: string) => {
  await getPromotionById(id);
  return repo.remove(id);
};
