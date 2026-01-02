import prisma from "@/config/db";
import { Prisma, ReviewStatus } from "@prisma/client";

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
            },
          },
          images: {
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
  },
} satisfies Prisma.reviewsSelect;

export const findReviewByOrderItemId = async (orderItemId: string) => {
  return prisma.reviews.findUnique({
    where: { orderItemId },
    select: reviewSelect,
  });
};

export const findReviewsByProductId = async (productId: string, approvedOnly = true) => {
  return prisma.reviews.findMany({
    where: {
      orderItem: {
        productVariant: {
          productId,
        },
      },
      ...(approvedOnly && { isApproved: ReviewStatus.APPROVED }),
    },
    select: reviewSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const findAllReviewsAdmin = async () => {
  return prisma.reviews.findMany({
    select: reviewSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const findReviewById = async (id: string) => {
  return prisma.reviews.findUnique({
    where: { id },
    select: reviewSelect,
  });
};

export const createReview = async (data: {
  userId: string;
  orderItemId: string;
  rating: number;
  comment?: string;
}) => {
  return prisma.reviews.create({
    data,
    select: reviewSelect,
  });
};

export const updateReview = async (id: string, data: Prisma.reviewsUpdateInput) => {
  return prisma.reviews.update({
    where: { id },
    data,
    select: reviewSelect,
  });
};

export const deleteReview = async (id: string) => {
  return prisma.reviews.delete({
    where: { id },
  });
};
