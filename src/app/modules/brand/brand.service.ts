import { CreateBrandInput, UpdateBrandInput, ListBrandsQuery } from "./brand.validation";
import { brandRepository } from "./brand.repository";
import { generateUniqueBrandSlug, deleteOldBrandImage } from "./brand.helpers";

export class BrandService {
  async getBrandsPublic(query: ListBrandsQuery) {
    return await brandRepository.findAllPublic(query);
  }

  async getBrandsAdmin(query: ListBrandsQuery) {
    return await brandRepository.findAllAdmin(query);
  }

  async getActiveBrands() {
    return await brandRepository.getActiveBrands();
  }

  async getFeaturedBrands(limit?: number) {
    return await brandRepository.getFeaturedBrands(limit);
  }

  async getBrandBySlug(slug: string) {
    const brand = await brandRepository.getBrandBySlug(slug);

    if (!brand) {
      const error: any = new Error("Không tìm thấy thương hiệu");
      error.statusCode = 404;
      throw error;
    }

    return brand;
  }

  async getBrandDetail(id: string) {
    const brand = await brandRepository.getBrandById(id);

    if (!brand) {
      const error: any = new Error("Không tìm thấy thương hiệu");
      error.statusCode = 404;
      throw error;
    }

    return brand;
  }

  async createBrand(data: CreateBrandInput) {
    const nameExists = await brandRepository.checkNameExists(data.name);
    if (nameExists) {
      const error: any = new Error("Tên thương hiệu đã tồn tại");
      error.statusCode = 400;
      throw error;
    }

    const slug = await generateUniqueBrandSlug(data.name, (slug) =>
      brandRepository.checkSlugExists(slug),
    );

    const brand = await brandRepository.createBrand({
      ...data,
      slug,
    });

    return brand;
  }

  async updateBrand(id: string, data: UpdateBrandInput) {
    const existingBrand = await brandRepository.getBrandById(id);
    if (!existingBrand) {
      const error: any = new Error("Không tìm thấy thương hiệu");
      error.statusCode = 404;
      throw error;
    }

    const updateData: any = { ...data };

    if (data.name && data.name !== existingBrand.name) {
      const nameExists = await brandRepository.checkNameExists(data.name, id);
      if (nameExists) {
        const error: any = new Error("Tên thương hiệu đã tồn tại");
        error.statusCode = 400;
        throw error;
      }

      updateData.slug = await generateUniqueBrandSlug(
        data.name,
        (slug) => brandRepository.checkSlugExists(slug, id),
        existingBrand.slug,
      );
    }

    if (data.imagePath && existingBrand.imagePath) {
      await deleteOldBrandImage(existingBrand.imagePath);
    }

    if (data.removeImage && existingBrand.imagePath) {
      await deleteOldBrandImage(existingBrand.imagePath);
      updateData.imagePath = null;
      updateData.imageUrl = null;
    }

    const brand = await brandRepository.updateBrand(id, updateData);
    return brand;
  }

  async deleteBrand(id: string) {
    const brand = await brandRepository.getBrandById(id);
    if (!brand) {
      const error: any = new Error("Không tìm thấy thương hiệu");
      error.statusCode = 404;
      throw error;
    }

    const productCount = await brandRepository.countProductsByBrandId(id);
    if (productCount > 0) {
      const error: any = new Error(
        `Không thể xóa thương hiệu này vì đang có ${productCount} sản phẩm liên kết`,
      );
      error.statusCode = 400;
      throw error;
    }

    if (brand.imagePath) {
      await deleteOldBrandImage(brand.imagePath);
    }

    await brandRepository.deleteBrand(id);
  }
}

export const brandService = new BrandService();
