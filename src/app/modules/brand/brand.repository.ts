import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { CreateBrandInput, UpdateBrandInput, ListBrandsQuery } from "./brand.validation";

// Select dùng cho public — không expose soft delete metadata
const selectPublic = {
  id: true,
  name: true,
  slug: true,
  imagePath: true,
  imageUrl: true,
  description: true,
  isFeatured: true,
  _count: { select: { products: true } },
} satisfies Prisma.brandsSelect;

// Select dùng cho admin — thêm soft delete metadata + full fields
const selectAdmin = {
  id: true,
  name: true,
  slug: true,
  imagePath: true,
  imageUrl: true,
  description: true,
  isFeatured: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  _count: { select: { products: true } },
} satisfies Prisma.brandsSelect;

const buildBrandWhere = (query: ListBrandsQuery, onlyActive: boolean, isAdmin: boolean): Prisma.brandsWhereInput => {
  const where: Prisma.brandsWhereInput = {};

  // Soft delete filter: public/staff chỉ thấy brand chưa xóa
  // Admin + includeDeleted=true: thấy tất cả kể cả đã xóa
  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  if (onlyActive) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured;
  }

  return where;
};

const buildBrandOrderBy = (query: ListBrandsQuery): Prisma.brandsOrderByWithRelationInput[] => {
  if (query.sortBy === "productCount") {
    return [{ products: { _count: query.sortOrder } }];
  }
  if (query.sortBy === "createdAt") {
    return [{ createdAt: query.sortOrder }];
  }
  return [{ name: query.sortOrder }];
};

// checkSlugExists loại trừ brand đã soft delete tránh collision khi restore
export const checkSlugExists = async (slug: string, excludeId?: string): Promise<boolean> => {
  const brand = await prisma.brands.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true },
  });
  if (!brand) return false;
  if (excludeId && brand.id === excludeId) return false;
  return true;
};

// checkNameExists loại trừ brand đã soft delete
export const checkNameExists = async (name: string, excludeId?: string): Promise<boolean> => {
  const brand = await prisma.brands.findFirst({
    where: { name, deletedAt: null },
    select: { id: true },
  });
  if (!brand) return false;
  if (excludeId && brand.id === excludeId) return false;
  return true;
};

export const findAllPublic = async (query: ListBrandsQuery) => {
  const where = buildBrandWhere(query, true, false);
  const orderBy = buildBrandOrderBy(query);
  return prisma.brands.findMany({ where, orderBy, select: selectPublic });
};

export const findAllAdmin = async (query: ListBrandsQuery) => {
  const where = buildBrandWhere(query, false, true);
  const orderBy = buildBrandOrderBy(query);
  return prisma.brands.findMany({ where, orderBy, select: selectAdmin });
};

export const getActiveBrands = async () => {
  return prisma.brands.findMany({
    where: { isActive: true, deletedAt: null },
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
};

export const getFeaturedBrands = async (limit = 6) => {
  return prisma.brands.findMany({
    where: { isActive: true, isFeatured: true, deletedAt: null },
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
};

// Public: chỉ thấy brand active + chưa xóa
export const findBySlug = async (slug: string) => {
  return prisma.brands.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    select: selectPublic,
  });
};

// Admin: có thể xem brand đã soft delete bằng includeDeleted
export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;
  return prisma.brands.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectAdmin : selectPublic,
  });
};

export const create = async (data: CreateBrandInput & { slug: string }) => {
  return prisma.brands.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      imagePath: data.imagePath || null,
      imageUrl: data.imageUrl || null,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
    },
    select: selectAdmin,
  });
};

// update chỉ áp dụng cho brand chưa soft delete
export const update = async (id: string, data: UpdateBrandInput & { slug?: string }) => {
  const updateData: Prisma.brandsUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.brands.update({
    where: { id, deletedAt: null },
    data: updateData,
    select: selectAdmin,
  });
};

// Soft delete — Admin only
// Brand bị soft delete sẽ không hiện ở public, không tính name/slug collision
export const softDelete = async (id: string, deletedById: string) => {
  return prisma.brands.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedById,
      isActive: false,
    },
  });
};

// Restore từ trash — Admin only
export const restore = async (id: string) => {
  return prisma.brands.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectAdmin,
  });
};

// Hard delete — Admin only, CHỈ sau khi đã soft delete
// Không xóa ảnh Cloudinary ở đây — service xử lý trước khi gọi
export const hardDelete = async (id: string) => {
  return prisma.brands.delete({ where: { id } });
};

export const countProducts = async (id: string): Promise<number> => {
  return prisma.products.count({ where: { brandId: id, deletedAt: null } });
};

// Lấy danh sách brand đã soft delete — Admin only (trang trash)
export const findAllDeleted = async (options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.brands.findMany({
      where: { deletedAt: { not: null } },
      select: selectAdmin,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.brands.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { data, total, page, limit };
};
