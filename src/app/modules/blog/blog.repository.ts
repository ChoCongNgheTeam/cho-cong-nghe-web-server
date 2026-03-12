import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListBlogsQuery } from "./blog.validation";
import { BlogStatus } from "./blog.types";

//  Select Fields

const selectAuthor = {
  id: true,
  fullName: true,
  email: true,
  avatarImage: true,
};

/**
 * Card dùng cho list — public & admin
 * Không include content đầy đủ (dùng excerpt trong transformer)
 */
const selectBlogCard = {
  id: true,
  title: true,
  slug: true,
  content: true,
  imageUrl: true,
  viewCount: true,
  status: true,
  createdAt: true,
  publishedAt: true,
  author: { select: selectAuthor },
};

/**
 * Detail — thêm updatedAt so với card
 */
const selectBlogDetail = {
  ...selectBlogCard,
  updatedAt: true,
  // imagePath cần để delete ảnh cũ trên cloudinary
  imagePath: true,
};

/**
 * Admin — thêm soft delete metadata
 */
const selectBlogAdmin = {
  ...selectBlogDetail,
  deletedAt: true,
  deletedBy: true,
};

//  Query Builder

const buildBlogWhere = (query: ListBlogsQuery, onlyPublished: boolean, isAdmin: boolean): Prisma.blogsWhereInput => {
  const where: Prisma.blogsWhereInput = {};

  // Soft delete filter:
  // - Public & Staff: chỉ thấy blog chưa xóa
  // - Admin + includeDeleted=true: thấy tất cả kể cả đã xóa
  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  // Public chỉ thấy PUBLISHED
  if (onlyPublished) {
    where.status = BlogStatus.PUBLISHED;
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [{ title: { contains: query.search, mode: "insensitive" } }, { content: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.authorId) {
    where.authorId = query.authorId;
  }

  return where;
};

//  Queries

export const findAllPublic = async (query: ListBlogsQuery) => {
  return _findAll(query, { onlyPublished: true, isAdmin: false });
};

export const findAllAdmin = async (query: ListBlogsQuery) => {
  return _findAll(query, { onlyPublished: false, isAdmin: true });
};

const _findAll = async (query: ListBlogsQuery, options: { onlyPublished: boolean; isAdmin: boolean }) => {
  const { page, limit, sortBy, sortOrder } = query;
  const { onlyPublished, isAdmin } = options;
  const skip = (page - 1) * limit;

  const where = buildBlogWhere(query, onlyPublished, isAdmin);
  const orderBy: Prisma.blogsOrderByWithRelationInput = { [sortBy]: sortOrder };
  const select = isAdmin ? selectBlogAdmin : selectBlogCard;

  const [data, total] = await prisma.$transaction([prisma.blogs.findMany({ where, select, orderBy, skip, take: limit }), prisma.blogs.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/**
 * Tìm theo id.
 * - Mặc định: bỏ qua blog đã soft delete.
 * - Admin + includeDeleted=true: tìm cả blog trong trash.
 */
export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;

  return prisma.blogs.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectBlogAdmin : selectBlogDetail,
  });
};

/**
 * Tìm theo slug — public, chỉ lấy blog chưa xóa
 */
export const findBySlug = async (slug: string) => {
  return prisma.blogs.findFirst({
    where: { slug, deletedAt: null },
    select: selectBlogDetail,
  });
};

export const create = async (authorId: string, data: Prisma.blogsCreateInput | any) => {
  return prisma.blogs.create({
    data: { ...data, authorId },
    select: selectBlogDetail,
  });
};

/**
 * Update — tự động loại blog đã soft delete ra khỏi where
 */
export const update = async (id: string, data: Prisma.blogsUpdateInput | any) => {
  return prisma.blogs.update({
    where: { id, deletedAt: null },
    data,
    select: selectBlogDetail,
  });
};

/**
 * Soft delete — Staff & Admin.
 * deletedBy: audit log — biết ai thực hiện
 */
export const softDelete = async (id: string, deletedById: string) => {
  return prisma.blogs.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedById,
    },
  });
};

/**
 * Restore blog từ trash — Admin only
 */
export const restore = async (id: string) => {
  return prisma.blogs.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectBlogAdmin,
  });
};

/**
 * Hard delete — Admin only, CHỈ sau khi đã soft delete.
 * Không cần xóa comments thủ công vì comments dùng soft delete riêng,
 * nhưng nếu muốn dọn sạch thì soft delete comments luôn (xem service).
 */
export const hardDelete = async (id: string) => {
  return prisma.blogs.delete({ where: { id } });
};

/**
 * Bulk soft delete — Admin & Staff
 */
export const bulkSoftDelete = async (ids: string[], deletedById: string) => {
  return prisma.blogs.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });
};

/**
 * Bulk restore — Admin only
 */
export const bulkRestore = async (ids: string[]) => {
  return prisma.blogs.updateMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    data: { deletedAt: null, deletedBy: null },
  });
};

export const bulkUpdate = async (ids: string[], updates: Prisma.blogsUpdateManyMutationInput) => {
  return prisma.blogs.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: updates,
  });
};

export const incrementViewCount = async (id: string) => {
  return prisma.blogs.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
};

//  Utility

/**
 * checkSlugExists loại trừ blog đã soft delete để tránh slug collision khi restore
 */
export const checkSlugExists = async (slug: string, excludeId?: string) => {
  const blog = await prisma.blogs.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true },
  });

  if (!blog) return false;
  if (excludeId && blog.id === excludeId) return false;
  return true;
};

/**
 * Lấy danh sách blog trong trash — Admin only
 */
export const findAllDeleted = async (options: Pick<ListBlogsQuery, "page" | "limit">) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.blogs.findMany({
      where: { deletedAt: { not: null } },
      select: selectBlogAdmin,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blogs.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};
