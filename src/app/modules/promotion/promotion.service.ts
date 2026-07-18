import * as repo from "./promotion.repository";
import { CreatePromotionInput, UpdatePromotionInput, ListPromotionsQuery, ListDeletedPromotionsQuery } from "./promotion.validation";
import { transformPromotionCard, transformPromotionDetail } from "./promotion.transformers";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import { revalidateTags } from "@/shared/cache/revalidate.service";
import { CACHE_TAGS } from "@/shared/cache/cache-tags.constants";

// Tag cache Home bị ảnh hưởng bởi mọi thay đổi promotion:
// - SALE_SCHEDULE: lịch sale + sản phẩm hôm nay
// - HOME_PRODUCTS: featured/best-selling ở Home hiển thị giá đã áp promotion
const PROMOTION_CACHE_TAGS = [CACHE_TAGS.SALE_SCHEDULE, CACHE_TAGS.HOME_PRODUCTS];

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
  return transformPromotionDetail(promotion);
};

// =====================
// === ADMIN: create, update ===
// =====================

export const createPromotion = async (input: CreatePromotionInput) => {
  const exists = await repo.checkPromotionName(input.name);
  if (exists) throw new BadRequestError("Tên khuyến mãi đã tồn tại");

  const promotion = await repo.create(input);
  revalidateTags(PROMOTION_CACHE_TAGS);
  return transformPromotionDetail(promotion);
};

export const updatePromotion = async (id: string, input: UpdatePromotionInput) => {
  const existing = await assertPromotionExists(id, { isAdmin: true });

  if (input.name && input.name !== existing.name) {
    const nameExists = await repo.checkPromotionName(input.name, id);
    if (nameExists) throw new BadRequestError("Tên khuyến mãi đã tồn tại");
  }

  await repo.update(id, input);
  revalidateTags(PROMOTION_CACHE_TAGS);

  // Fetch lại với targetName đầy đủ (như findById đã làm lookup brand/category/product)
  const updated = await repo.findById(id, { isAdmin: true });
  return transformPromotionDetail(updated!);
};
// =====================
// === ADMIN: soft delete, restore, hard delete, trash ===
// =====================

export const softDeletePromotion = async (id: string, deletedById: string) => {
  await assertPromotionExists(id);
  const result = await repo.softDelete(id, deletedById);
  revalidateTags(PROMOTION_CACHE_TAGS);
  return result;
};

// Bulk soft delete — dùng updateMany 1 query, so count ids đầu vào để phát hiện
// id không tồn tại / đã bị xóa trước đó, tránh loop findById (N+1).
export const bulkSoftDeletePromotion = async (ids: string[], deletedById: string) => {
  const result = await repo.softDeleteMany(ids, deletedById);
  if (result.count < ids.length) {
    throw new NotFoundError(`Khuyến mãi (chỉ xóa được ${result.count}/${ids.length} ID — một số ID không tồn tại hoặc đã bị xóa)`);
  }
  revalidateTags(PROMOTION_CACHE_TAGS);
  return { deletedCount: result.count };
};

export const restorePromotion = async (id: string) => {
  const promotion = await repo.findById(id, {
    includeDeleted: true,
    isAdmin: true,
  });
  if (!promotion) throw new NotFoundError("Khuyến mãi");
  if (!promotion.deletedAt) throw new BadRequestError("Khuyến mãi này chưa bị xóa");

  const nameConflict = await repo.checkPromotionName(promotion.name, id);
  if (nameConflict) {
    throw new BadRequestError(`Không thể khôi phục vì tên "${promotion.name}" đã được dùng bởi khuyến mãi khác`);
  }

  const result = await repo.restore(id);
  revalidateTags(PROMOTION_CACHE_TAGS);
  return result;
};

export const hardDeletePromotion = async (id: string) => {
  const promotion = await repo.findById(id, { includeDeleted: true, isAdmin: true });
  if (!promotion) throw new NotFoundError("Khuyến mãi");
  if (!promotion.deletedAt) throw new ForbiddenError("Phải soft delete khuyến mãi trước khi xóa vĩnh viễn");

  // Nên thêm — cảnh báo nghiệp vụ dù DB không constraint:
  if (promotion.usedCount > 0) {
    throw new BadRequestError(`Không thể xóa: khuyến mãi đã được áp dụng ${promotion.usedCount} lần`);
  }

  const result = await repo.hardDelete(id);
  revalidateTags(PROMOTION_CACHE_TAGS);
  return result;
};

export const getDeletedPromotions = async (options: ListDeletedPromotionsQuery) => {
  return repo.findAllDeleted(options);
};

// =====================
// === PRICING ENGINE ===
// =====================

export const getActivePromotionsForPricing = async () => {
  return repo.getActivePromotions();
};
