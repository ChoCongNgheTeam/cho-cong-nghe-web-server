import { CreateBrandInput, UpdateBrandInput, ListBrandsQuery } from "./brand.validation";
import * as brandRepository from "./brand.repository";
import { generateUniqueBrandSlug, deleteOldBrandImage } from "./brand.helpers";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";

const assertBrandExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const brand = await brandRepository.findById(id, options);
  if (!brand) throw new NotFoundError("Thương hiệu");
  return brand;
};

// Public

export const getBrandsPublic = async (query: ListBrandsQuery) => {
  return brandRepository.findAllPublic(query);
};

export const getActiveBrands = async () => {
  return brandRepository.getActiveBrands();
};

export const getFeaturedBrands = async (limit?: number) => {
  return brandRepository.getFeaturedBrands(limit);
};

export const getBrandBySlug = async (slug: string) => {
  const brand = await brandRepository.findBySlug(slug);
  if (!brand) throw new NotFoundError("Thương hiệu");
  return brand;
};

// Admin: list, detail

export const getBrandsAdmin = async (query: ListBrandsQuery) => {
  return brandRepository.findAllAdmin(query);
};

export const getBrandDetail = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  return assertBrandExists(id, options);
};

// Admin: create, update

export const createBrand = async (data: CreateBrandInput) => {
  const nameExists = await brandRepository.checkNameExists(data.name);
  if (nameExists) throw new BadRequestError("Tên thương hiệu đã tồn tại");

  const slug = await generateUniqueBrandSlug(data.name, (s) => brandRepository.checkSlugExists(s));

  return brandRepository.create({ ...data, slug });
};

export const updateBrand = async (id: string, data: UpdateBrandInput) => {
  const existing = await assertBrandExists(id, { isAdmin: true });
  const updateData: any = { ...data };

  if (data.name && data.name !== (existing as any).name) {
    const nameExists = await brandRepository.checkNameExists(data.name, id);
    if (nameExists) throw new BadRequestError("Tên thương hiệu đã tồn tại");

    updateData.slug = await generateUniqueBrandSlug(data.name, (s) => brandRepository.checkSlugExists(s, id), (existing as any).slug);
  }

  if (data.imagePath && (existing as any).imagePath) {
    await deleteOldBrandImage((existing as any).imagePath);
  }

  if (data.removeImage && (existing as any).imagePath) {
    await deleteOldBrandImage((existing as any).imagePath);
    updateData.imagePath = null;
    updateData.imageUrl = null;
  }

  delete updateData.removeImage;

  return brandRepository.update(id, updateData);
};

// Soft delete — Admin only
export const softDeleteBrand = async (id: string, deletedById: string) => {
  await assertBrandExists(id);

  const productCount = await brandRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(`Không thể xóa thương hiệu này vì đang có ${productCount} sản phẩm liên kết`);
  }

  return brandRepository.softDelete(id, deletedById);
};

// Restore — Admin only
export const restoreBrand = async (id: string) => {
  const brand = (await brandRepository.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!brand) throw new NotFoundError("Thương hiệu");
  if (!brand.deletedAt) throw new BadRequestError("Thương hiệu này chưa bị xóa");

  const nameConflict = await brandRepository.checkNameExists(brand.name, id);
  if (nameConflict) {
    throw new BadRequestError(`Không thể khôi phục vì tên "${brand.name}" đã được dùng bởi thương hiệu khác`);
  }

  return brandRepository.restore(id);
};

// Hard delete — Admin only, CHỈ sau khi đã soft delete
export const hardDeleteBrand = async (id: string) => {
  const brand = (await brandRepository.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!brand) throw new NotFoundError("Thương hiệu");

  if (!brand.deletedAt) {
    throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn. Dùng DELETE /admin/brands/:id");
  }

  if (brand.imagePath) {
    await deleteOldBrandImage(brand.imagePath);
  }

  return brandRepository.hardDelete(id);
};

// Trash list — Admin only
export const getDeletedBrands = async (options: { page?: number; limit?: number } = {}) => {
  return brandRepository.findAllDeleted(options);
};
