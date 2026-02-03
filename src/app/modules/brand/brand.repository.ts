import { PrismaClient } from "@prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "./brand.validation";

const prisma = new PrismaClient();

export class BrandRepository {
  // Kiểm tra slug đã tồn tại chưa
  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const brand = await prisma.brands.findUnique({
      where: { slug },
    });

    if (!brand) return false;
    if (excludeId && brand.id === excludeId) return false;

    return true;
  }

  // Kiểm tra tên đã tồn tại chưa
  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const brand = await prisma.brands.findUnique({
      where: { name },
    });

    if (!brand) return false;
    if (excludeId && brand.id === excludeId) return false;

    return true;
  }

  // Lấy tất cả brands (admin)
  async getAllBrands() {
    return await prisma.brands.findMany({
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  // Lấy brands active (public)
  async getActiveBrands() {
    return await prisma.brands.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        imagePath: true,
        imageUrl: true,
        isFeatured: true,
      },
    });
  }

  // Lấy featured brands
  async getFeaturedBrands(limit: number = 6) {
    return await prisma.brands.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        imagePath: true,
        imageUrl: true,
        description: true,
      },
    });
  }

  // Lấy brand theo slug (public)
  async getBrandBySlug(slug: string) {
    return await prisma.brands.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  // Lấy brand detail (admin)
  async getBrandById(id: string) {
    return await prisma.brands.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  // Tạo brand mới
  async createBrand(
    data: CreateBrandInput & { slug: string; imagePath?: string; imageUrl?: string },
  ) {
    return await prisma.brands.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        imagePath: data.imagePath || null,
        imageUrl: data.imageUrl || null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
      },
    });
  }

  // Cập nhật brand
  async updateBrand(
    id: string,
    data: UpdateBrandInput & { slug?: string; imagePath?: string | null; imageUrl?: string | null },
  ) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }
    if (data.imagePath !== undefined) {
      updateData.imagePath = data.imagePath;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.brands.update({
      where: { id },
      data: updateData,
    });
  }

  // Xóa brand
  async deleteBrand(id: string) {
    return await prisma.brands.delete({
      where: { id },
    });
  }

  // Đếm số sản phẩm của brand
  async countProductsByBrandId(id: string): Promise<number> {
    return await prisma.products.count({
      where: { brandId: id },
    });
  }
}

export const brandRepository = new BrandRepository();
