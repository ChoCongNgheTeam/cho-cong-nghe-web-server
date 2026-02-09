import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListBlogsQuery } from "./blog.validation";
import { BlogStatus } from "./blog.types";

const selectAuthor = {
  id: true,
  fullName: true,
  email: true,
  avatarImage: true,
};

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
  author: {
    select: selectAuthor,
  },
};

const selectBlogDetail = {
  id: true,
  title: true,
  slug: true,
  content: true,
  imageUrl: true,
  viewCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  author: {
    select: selectAuthor,
  },
};

// =====================
// === QUERY BUILDERS ===
// =====================

const buildBlogWhere = (query: ListBlogsQuery, onlyPublished: boolean): Prisma.blogsWhereInput => {
  const where: Prisma.blogsWhereInput = {};

  // Only published blogs for public
  if (onlyPublished) {
    where.status = BlogStatus.PUBLISHED;
  } else if (query.status) {
    where.status = query.status;
  }

  // Search
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { content: { contains: query.search, mode: "insensitive" } },
    ];
  }

  console.log(query.search);

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  // Author filter
  if (query.authorId) {
    where.authorId = query.authorId;
  }

  return where;
};

// =====================
// === QUERIES ===
// =====================

export const findAllPublic = async (query: ListBlogsQuery) => {
  return findAll(query, true);
};

export const findAllAdmin = async (query: ListBlogsQuery) => {
  return findAll(query, false);
};

const findAll = async (query: ListBlogsQuery, onlyPublished: boolean) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = buildBlogWhere(query, onlyPublished);

  const orderBy: Prisma.blogsOrderByWithRelationInput = { [sortBy]: sortOrder };

  const [data, total] = await Promise.all([
    prisma.blogs.findMany({
      where,
      select: selectBlogCard,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.blogs.count({ where }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const findById = async (id: string) => {
  return prisma.blogs.findUnique({
    where: { id },
    select: selectBlogDetail,
  });
};

export const findBySlug = async (slug: string) => {
  return prisma.blogs.findUnique({
    where: { slug },
    select: selectBlogDetail,
  });
};

export const create = async (authorId: string, data: any) => {
  return prisma.blogs.create({
    data: {
      ...data,
      authorId,
    },
    select: selectBlogDetail,
  });
};

export const update = async (id: string, data: any) => {
  return prisma.blogs.update({
    where: { id },
    data,
    select: selectBlogDetail,
  });
};

export const remove = async (id: string) => {
  // Delete comments first (cascade)
  await prisma.comments.deleteMany({
    where: {
      targetType: "BLOG",
      targetId: id,
    },
  });

  return prisma.blogs.delete({
    where: { id },
  });
};

export const incrementViewCount = async (id: string) => {
  return prisma.blogs.update({
    where: { id },
    data: {
      viewCount: { increment: 1 },
    },
  });
};

// =====================
// === UTILITY ===
// =====================

export const checkSlugExists = async (slug: string, excludeId?: string) => {
  const blog = await prisma.blogs.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!blog) return false;
  if (excludeId && blog.id === excludeId) return false;
  return true;
};

export const bulkUpdate = async (blogIds: string[], updates: any) => {
  return prisma.blogs.updateMany({
    where: { id: { in: blogIds } },
    data: updates,
  });
};

/**
 * Get blog IDs for comments count
 * This will be used by orchestrator
 */
export const getBlogIdsByIds = async (ids: string[]): Promise<string[]> => {
  const blogs = await prisma.blogs.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return blogs.map((b) => b.id);
};
