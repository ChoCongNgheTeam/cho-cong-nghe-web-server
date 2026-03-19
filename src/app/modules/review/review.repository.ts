import prisma from "@/config/db";
import { Prisma, ReviewStatus } from "@prisma/client";
import { ListReviewsQuery } from "./review.validation";

// ── Select Fields ──────────────────────────────────────────────────────────

const selectColorImage = {
  id: true,
  color: true,
  imageUrl: true,
  altText: true,
  position: true,
};

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  isApproved: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      avatarImage: true,
    },
  },
  orderItem: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      productVariant: {
        select: {
          id: true,
          code: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              img: {
                select: selectColorImage,
                orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
                take: 1,
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.reviewsSelect;

const reviewSelectAdmin = {
  ...reviewSelect,
  deletedAt: true,
  deletedBy: true,
} satisfies Prisma.reviewsSelect;

// ── Query Builder ──────────────────────────────────────────────────────────

const buildReviewWhere = (query: ListReviewsQuery, isAdmin: boolean): Prisma.reviewsWhereInput => {
  const where: Prisma.reviewsWhereInput = {};

  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  if (query.isApproved !== undefined) {
    where.isApproved = query.isApproved as ReviewStatus;
  }

  if (query.rating !== undefined) {
    where.rating = query.rating;
  }

  if (query.productId) {
    where.orderItem = {
      productVariant: { productId: query.productId },
    };
  }

  if (query.search) {
    where.comment = { contains: query.search, mode: "insensitive" };
  }

  return where;
};

// ── Queries ────────────────────────────────────────────────────────────────

export const findAllReviewsAdmin = async (query: ListReviewsQuery) => {
  const { page, limit, sortOrder } = query;
  const skip = (page - 1) * limit;
  const where = buildReviewWhere(query, true);

  const [data, total] = await prisma.$transaction([
    prisma.reviews.findMany({
      where,
      select: reviewSelectAdmin,
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
    }),
    prisma.reviews.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllDeleted = async (options: Pick<ListReviewsQuery, "page" | "limit">) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.reviews.findMany({
      where: { deletedAt: { not: null } },
      select: reviewSelectAdmin,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.reviews.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findReviewByOrderItemId = async (orderItemId: string) => {
  return prisma.reviews.findUnique({
    where: { orderItemId },
    select: reviewSelect,
  });
};

export const findReviewsByProductId = async (productId: string, approvedOnly = true) => {
  return prisma.reviews.findMany({
    where: {
      deletedAt: null,
      orderItem: { productVariant: { productId } },
      ...(approvedOnly && { isApproved: ReviewStatus.APPROVED }),
    },
    select: reviewSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const findReviewById = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  return prisma.reviews.findFirst({
    where: {
      id,
      ...(!options.includeDeleted ? { deletedAt: null } : {}),
    },
    select: reviewSelectAdmin,
  });
};

export const createReview = async (data: { userId: string; orderItemId: string; rating: number; comment?: string }) => {
  return prisma.reviews.create({
    data,
    select: reviewSelect,
  });
};

export const updateReview = async (id: string, data: Prisma.reviewsUpdateInput) => {
  return prisma.reviews.update({
    where: { id, deletedAt: null },
    data,
    select: reviewSelect,
  });
};

export const softDelete = async (id: string, deletedById: string) => {
  return prisma.reviews.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });
};

export const restore = async (id: string) => {
  return prisma.reviews.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: reviewSelectAdmin,
  });
};

export const hardDelete = async (id: string) => {
  return prisma.reviews.delete({ where: { id } });
};

export const bulkApprove = async (reviewIds: string[], isApproved: ReviewStatus) => {
  return prisma.reviews.updateMany({
    where: { id: { in: reviewIds }, deletedAt: null },
    data: { isApproved },
  });
};

export const bulkSoftDelete = async (ids: string[], deletedById: string) => {
  return prisma.reviews.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });
};

export const bulkRestore = async (ids: string[]) => {
  return prisma.reviews.updateMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    data: { deletedAt: null, deletedBy: null },
  });
};
