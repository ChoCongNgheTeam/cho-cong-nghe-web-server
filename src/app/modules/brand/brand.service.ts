import { CreateBrandInput, UpdateBrandInput } from "./brand.validation";
import { brandRepository } from "./brand.repository";
import { generateUniqueBrandSlug } from "./brand.helper";
import { DuplicateError, NotFoundError, BadRequestError } from "@/utils/errors";
import { deleteImage } from "@/services/cloudinary.service";

export class BrandService {
  // Lấy tất cả brands (admin)
  async getAllBrands() {
    return await brandRepository.getAllBrands();
  }

  // Lấy brands active (public)
  async getActiveBrands() {
    return await brandRepository.getActiveBrands();
  }

  // Lấy featured brands
  async getFeaturedBrands(limit?: number) {
    return await brandRepository.getFeaturedBrands(limit);
  }

  // Lấy brand theo slug
  async getBrandBySlug(slug: string) {
    const brand = await brandRepository.getBrandBySlug(slug);

    if (!brand) {
      throw new NotFoundError("thương hiệu");
    }

    return brand;
  }

  // Lấy brand detail (admin)
  async getBrandDetail(id: string) {
    const brand = await brandRepository.getBrandById(id);

    if (!brand) {
      throw new NotFoundError("thương hiệu");
    }

    return brand;
  }

  // Tạo brand mới
  async createBrand(
    data: CreateBrandInput,
    uploadedImage?: { imagePath: string; imageUrl: string },
  ) {
    // Kiểm tra tên đã tồn tại
    const nameExists = await brandRepository.checkNameExists(data.name);
    if (nameExists) {
      throw new DuplicateError("Tên thương hiệu");
    }

    // Tạo slug unique
    const slug = await generateUniqueBrandSlug(data.name, (slug) =>
      brandRepository.checkSlugExists(slug),
    );

    // Tạo brand
    const brand = await brandRepository.createBrand({
      ...data,
      slug,
      imagePath: uploadedImage?.imagePath,
      imageUrl: uploadedImage?.imageUrl,
    });

    return brand;
  }

  // Cập nhật brand
  async updateBrand(
    id: string,
    data: UpdateBrandInput & { removeImage?: boolean },
    uploadedImage?: { imagePath: string; imageUrl: string },
  ) {
    // Kiểm tra brand có tồn tại
    const existingBrand = await brandRepository.getBrandById(id);
    if (!existingBrand) {
      throw new NotFoundError("thương hiệu");
    }

    // Nếu có thay đổi tên
    let newSlug: string | undefined;
    if (data.name && data.name !== existingBrand.name) {
      // Kiểm tra tên mới có bị trùng không
      const nameExists = await brandRepository.checkNameExists(data.name, id);
      if (nameExists) {
        throw new DuplicateError("Tên thương hiệu");
      }

      // Tạo slug mới
      newSlug = await generateUniqueBrandSlug(
        data.name,
        (slug) => brandRepository.checkSlugExists(slug, id),
        existingBrand.slug,
      );
    }

    // Xử lý image
    let imageData: any = {};

    // Nếu có upload image mới
    if (uploadedImage) {
      // Xóa image cũ nếu có
      if (existingBrand.imagePath) {
        try {
          await deleteImage(existingBrand.imagePath);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      imageData = {
        imagePath: uploadedImage.imagePath,
        imageUrl: uploadedImage.imageUrl,
      };
    }
    // Nếu yêu cầu xóa image
    else if (data.removeImage && existingBrand.imagePath) {
      try {
        await deleteImage(existingBrand.imagePath);
      } catch (error) {
        console.error("Error deleting image:", error);
      }

      imageData = {
        imagePath: null,
        imageUrl: null,
      };
    }

    // Update brand
    const updatedBrand = await brandRepository.updateBrand(id, {
      ...data,
      ...(newSlug && { slug: newSlug }),
      ...imageData,
    });

    return updatedBrand;
  }

  // Xóa brand
  async deleteBrand(id: string) {
    // Kiểm tra brand có tồn tại
    const brand = await brandRepository.getBrandById(id);
    if (!brand) {
      throw new NotFoundError("thương hiệu");
    }

    // Kiểm tra brand có sản phẩm nào không
    const productCount = await brandRepository.countProductsByBrandId(id);
    if (productCount > 0) {
      throw new BadRequestError(
        `Không thể xóa thương hiệu này vì đang có ${productCount} sản phẩm liên kết`,
      );
    }

    // Xóa image trên cloudinary nếu có
    if (brand.imagePath) {
      try {
        await deleteImage(brand.imagePath);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Xóa brand
    await brandRepository.deleteBrand(id);

    return { message: "Xóa thương hiệu thành công" };
  }
}

export const brandService = new BrandService();
