import { CreateBrandInput, UpdateBrandInput, ListBrandsQuery } from "./brand.validation";
import { brandRepository } from "./brand.repository";
import { generateUniqueBrandSlug, deleteOldBrandImage } from "./brand.helpers";
import { NotFoundError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";

export class BrandService {
  async getBrandsPublic(query: ListBrandsQuery) {
    return brandRepository.findAllPublic(query);
  }

  async getBrandsAdmin(query: ListBrandsQuery) {
    return brandRepository.findAllAdmin(query);
  }

  async getActiveBrands() {
    return brandRepository.getActiveBrands();
  }

  async getFeaturedBrands(limit?: number) {
    return brandRepository.getFeaturedBrands(limit);
  }

  async getBrandBySlug(slug: string, isAdmin: boolean = false) {
    const brand = await brandRepository.getBrandBySlug(slug, isAdmin);
    if (!brand) throw new NotFoundError("Thương hiệu");
    return brand;
  }

  async getBrandDetail(id: string, includeDeleted: boolean = false) {
    const brand = await brandRepository.getBrandById(id, includeDeleted);
    if (!brand) throw new NotFoundError("Thương hiệu");
    return brand;
  }

  async createBrand(data: CreateBrandInput) {
    const nameExists = await brandRepository.checkNameExists(data.name);
    if (nameExists) throw new BadRequestError("Tên thương hiệu đã tồn tại");

    const slug = await generateUniqueBrandSlug(data.name, (s) => brandRepository.checkSlugExists(s));

    return brandRepository.createBrand({ ...data, slug });
  }

  async updateBrand(id: string, data: UpdateBrandInput) {
    const existingBrand = await brandRepository.getBrandById(id);
    if (!existingBrand) throw new NotFoundError("Thương hiệu");

    const updateData: any = { ...data };

    if (data.name && data.name !== existingBrand.name) {
      const nameExists = await brandRepository.checkNameExists(data.name, id);
      if (nameExists) throw new BadRequestError("Tên thương hiệu đã tồn tại");

      updateData.slug = await generateUniqueBrandSlug(data.name, (s) => brandRepository.checkSlugExists(s, id), existingBrand.slug);
    }

    if (data.imagePath && existingBrand.imagePath) {
      await deleteOldBrandImage(existingBrand.imagePath);
    }

    if (data.removeImage && existingBrand.imagePath) {
      await deleteOldBrandImage(existingBrand.imagePath);
      updateData.imagePath = null;
      updateData.imageUrl = null;
    }

    return brandRepository.updateBrand(id, updateData);
  }

  async softDeleteBrand(id: string, userId: string) {
    const brand = await brandRepository.getBrandById(id);
    if (!brand) throw new NotFoundError("Thương hiệu");

    const productCount = await brandRepository.countProductsByBrandId(id);
    if (productCount > 0) {
      throw new BadRequestError(`Không thể xóa thương hiệu này vì đang có ${productCount} sản phẩm liên kết`);
    }

    await brandRepository.softDeleteBrand(id, userId);
  }

  async restoreBrand(id: string) {
    const brand = await brandRepository.getBrandById(id, true);
    if (!brand) throw new NotFoundError("Thương hiệu");
    if (!brand.deletedAt) throw new BadRequestError("Thương hiệu này chưa bị xóa");

    return brandRepository.restoreBrand(id);
  }

  async hardDeleteBrand(id: string) {
    const brand = await brandRepository.getBrandById(id, true);
    if (!brand) throw new NotFoundError("Thương hiệu");
    if (!brand.deletedAt) throw new BadRequestError("Phải chuyển vào thùng rác trước khi xóa vĩnh viễn");

    if (brand.imagePath) {
      await deleteOldBrandImage(brand.imagePath);
    }

    return await brandRepository.hardDeleteBrand(id).catch(handlePrismaError);
  }

  async getDeletedBrands(query: ListBrandsQuery) {
    return brandRepository.findAllDeleted(query);
  }
}

export const brandService = new BrandService();