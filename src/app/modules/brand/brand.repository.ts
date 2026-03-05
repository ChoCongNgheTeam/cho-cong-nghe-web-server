import { PrismaClient, Prisma } from "@prisma/client";
import { CreateBrandInput, UpdateBrandInput, ListBrandsQuery } from "./brand.validation";

const prisma = new PrismaClient();

const buildBrandWhere = (query: ListBrandsQuery, onlyActive: boolean): Prisma.brandsWhereInput => {
  const where: Prisma.brandsWhereInput = {};

  if (onlyActive) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured;
  }

  return where;
};

const buildBrandOrderBy = (query: ListBrandsQuery): Prisma.brandsOrderByWithRelationInput[] => {
  const orderBy: Prisma.brandsOrderByWithRelationInput[] = [];

  if (query.sortBy === "productCount") {
    orderBy.push({ products: { _count: query.sortOrder } });
  } else if (query.sortBy === "createdAt") {
    orderBy.push({ createdAt: query.sortOrder });
  } else {
    orderBy.push({ name: query.sortOrder });
  }

  return orderBy;
};

export class BrandRepository {
  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const brand = await prisma.brands.findUnique({
      where: { slug },
    });

    if (!brand) return false;
    if (excludeId && brand.id === excludeId) return false;

    return true;
  }

  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const brand = await prisma.brands.findUnique({
      where: { name },
    });

    if (!brand) return false;
    if (excludeId && brand.id === excludeId) return false;

    return true;
  }

  async findAllPublic(query: ListBrandsQuery) {
    const where = buildBrandWhere(query, true);
    const orderBy = buildBrandOrderBy(query);

    return await prisma.brands.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        imagePath: true,
        imageUrl: true,
        description: true,
        isFeatured: true,
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findAllAdmin(query: ListBrandsQuery) {
    const where = buildBrandWhere(query, false);
    const orderBy = buildBrandOrderBy(query);

    return await prisma.brands.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

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

  async createBrand(data: CreateBrandInput & { slug: string }) {
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

  async updateBrand(id: string, data: UpdateBrandInput & { slug?: string }) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.brands.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteBrand(id: string) {
    return await prisma.brands.delete({
      where: { id },
    });
  }

  async countProductsByBrandId(id: string): Promise<number> {
    return await prisma.products.count({
      where: { brandId: id },
    });
  }
}

export const brandRepository = new BrandRepository();
