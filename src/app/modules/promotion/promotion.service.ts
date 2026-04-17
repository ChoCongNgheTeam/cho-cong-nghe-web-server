import * as repo from "./promotion.repository";
import { CreatePromotionInput, UpdatePromotionInput, ListPromotionsQuery } from "./promotion.validation";
import { transformPromotionCard, transformPromotionDetail, transformPromotionDetailWithExisting } from "./promotion.transformers";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";

// Helper — đảm bảo promotion tồn tại
const assertPromotionExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const promotion = await repo.findById(id, options);
  if (!promotion) throw new NotFoundError("Khuyến mãi");
  return promotion;
};

// =====================
// === PUBLIC ===
// =====================

export const getPromotionsPublic = async (query: ListPromotionsQuery) => {
  const result = await repo.findAllPublic(query);
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

// =====================
// === ADMIN: list, detail ===
// =====================

export const getPromotionsAdmin = async (query: ListPromotionsQuery) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: result.data.map(transformPromotionDetail) };
};

export const getPromotionDetail = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const promotion = await assertPromotionExists(id, options);
  return transformPromotionDetail(promotion as any);
};

// =====================
// === ADMIN: create, update ===
// =====================

export const createPromotion = async (input: CreatePromotionInput) => {
  const exists = await repo.checkPromotionName(input.name);
  if (exists) throw new BadRequestError("Tên khuyến mãi đã tồn tại");

  const promotion = await repo.create(input);
  return transformPromotionDetail(promotion as any);
};

export const updatePromotion = async (id: string, input: UpdatePromotionInput) => {
  const existing = await assertPromotionExists(id, { isAdmin: true });

  if (input.name && input.name !== (existing as any).name) {
    const nameExists = await repo.checkPromotionName(input.name, id);
    if (nameExists) throw new BadRequestError("Tên khuyến mãi đã tồn tại");
  }

  await repo.update(id, input);

  // Fetch lại với targetName đầy đủ (như findById đã làm lookup brand/category/product)
  const updated = await repo.findById(id, { isAdmin: true });
  return transformPromotionDetail(updated as any);
};
// =====================
// === ADMIN: soft delete, restore, hard delete, trash ===
// =====================

export const softDeletePromotion = async (id: string, deletedById: string) => {
  await assertPromotionExists(id);
  return repo.softDelete(id, deletedById);
};

export const restorePromotion = async (id: string) => {
  const promotion = (await repo.findById(id, {
    includeDeleted: true,
    isAdmin: true,
  })) as any;
  if (!promotion) throw new NotFoundError("Khuyến mãi");
  if (!promotion.deletedAt) throw new BadRequestError("Khuyến mãi này chưa bị xóa");

  const nameConflict = await repo.checkPromotionName(promotion.name, id);
  if (nameConflict) {
    throw new BadRequestError(`Không thể khôi phục vì tên "${promotion.name}" đã được dùng bởi khuyến mãi khác`);
  }

  return repo.restore(id);
};

export const hardDeletePromotion = async (id: string) => {
  const promotion = (await repo.findById(id, {
    includeDeleted: true,
    isAdmin: true,
  })) as any;
  if (!promotion) throw new NotFoundError("Khuyến mãi");

  if (!promotion.deletedAt) {
    throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn. Dùng DELETE /admin/promotions/:id");
  }

  // Rules & targets tự xóa qua Cascade
  return repo.hardDelete(id);
};

export const getDeletedPromotions = async (options: { page?: number; limit?: number } = {}) => {
  return repo.findAllDeleted(options);
};

// =====================
// === PRICING ENGINE ===
// =====================

export const getActivePromotionsForPricing = async () => {
  return repo.getActivePromotions();
};
