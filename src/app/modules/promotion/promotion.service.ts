import * as repo from "./promotion.repository";
import { CreatePromotionInput, UpdatePromotionInput, ListPromotionsQuery } from "./promotion.validation";
import { transformPromotionCard, transformPromotionDetail } from "./promotion.transformers";
import { NotFoundError, BadRequestError } from "@/errors";

export const getPromotions = async (query: ListPromotionsQuery) => {
  const result = await repo.findAll(query);
  return { ...result, data: result.data.map(transformPromotionCard) };
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

export const getPromotionById = async (id: string) => {
  const promotion = await repo.findById(id);
  if (!promotion) throw new NotFoundError("Promotion");
  return transformPromotionDetail(promotion);
};

export const createPromotion = async (input: CreatePromotionInput) => {
  const exists = await repo.checkPromotionName(input.name);
  if (exists) throw new BadRequestError("Tên promotion đã tồn tại");

  const promotion = await repo.create(input);
  return transformPromotionDetail(promotion);
};

export const updatePromotion = async (id: string, input: UpdatePromotionInput) => {
  // getPromotionById throw NotFoundError nếu không tồn tại
  const existing = await getPromotionById(id);

  if (input.name && input.name !== existing.name) {
    const exists = await repo.checkPromotionName(input.name);
    if (exists) throw new BadRequestError("Tên promotion đã tồn tại");
  }

  const promotion = await repo.update(id, input);
  return transformPromotionDetail(promotion);
};

export const deletePromotion = async (id: string) => {
  await getPromotionById(id);
  return repo.remove(id);
};
