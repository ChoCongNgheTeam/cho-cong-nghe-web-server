import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListCommentsQuery } from "./comment.validation";
import { CommentTargetType } from "./comment.types";

const selectUser = {
  id: true,
  fullName: true,
  email: true,
  avatarImage: true,
};

const selectComment = {
  id: true,
  userId: true,
  content: true,
  targetType: true,
  targetId: true,
  parentId: true,
  isApproved: true,
  createdAt: true,
  user: {
    select: selectUser,
  },
};

const buildCommentWhere = (
  query: ListCommentsQuery,
  onlyApproved: boolean,
): Prisma.commentsWhereInput => {
  const where: Prisma.commentsWhereInput = {};

  if (onlyApproved) {
    where.isApproved = true;
  } else if (query.isApproved !== undefined) {
    where.isApproved = query.isApproved;
  }

  if (query.targetType) {
    where.targetType = query.targetType;
  }

  if (query.targetId) {
    where.targetId = query.targetId;
  }

  if (query.parentId !== undefined) {
    where.parentId = query.parentId;
  }

  return where;
};

export const findAllPublic = async (query: ListCommentsQuery) => {
  return findAll(query, true);
};

export const findAllAdmin = async (query: ListCommentsQuery) => {
  return findAll(query, false);
};

const findAll = async (query: ListCommentsQuery, onlyApproved: boolean) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = buildCommentWhere(query, onlyApproved);
  const orderBy: Prisma.commentsOrderByWithRelationInput = { [sortBy]: sortOrder };

  const [data, total] = await Promise.all([
    prisma.comments.findMany({
      where,
      select: selectComment,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.comments.count({ where }),
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
  return prisma.comments.findUnique({
    where: { id },
    select: selectComment,
  });
};

export const findByTarget = async (
  targetType: CommentTargetType,
  targetId: string,
  options: {
    page?: number;
    limit?: number;
    onlyApproved?: boolean;
    includeReplies?: boolean;
  } = {},
) => {
  const { page = 1, limit = 20, onlyApproved = true, includeReplies = true } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.commentsWhereInput = {
    targetType,
    targetId,
    parentId: null,
    ...(onlyApproved && { isApproved: true }),
  };

  const [data, total] = await Promise.all([
    prisma.comments.findMany({
      where,
      select: {
        ...selectComment,
        ...(includeReplies && {
          replies: {
            where: onlyApproved ? { isApproved: true } : {},
            select: selectComment,
            orderBy: { createdAt: "asc" },
          },
        }),
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.comments.count({ where }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCommentsCountByTargets = async (
  targetType: CommentTargetType,
  targetIds: string[],
  onlyApproved: boolean = true,
): Promise<Map<string, number>> => {
  const counts = await prisma.comments.groupBy({
    by: ["targetId"],
    where: {
      targetType,
      targetId: { in: targetIds },
      ...(onlyApproved && { isApproved: true }),
    },
    _count: {
      id: true,
    },
  });

  const map = new Map<string, number>();
  counts.forEach((item) => {
    map.set(item.targetId, item._count.id);
  });

  return map;
};

export const findReplies = async (parentId: string, onlyApproved: boolean = true) => {
  return prisma.comments.findMany({
    where: {
      parentId,
      ...(onlyApproved && { isApproved: true }),
    },
    select: selectComment,
    orderBy: { createdAt: "asc" },
  });
};

export const getRepliesCountByParentIds = async (
  parentIds: string[],
  onlyApproved: boolean = true,
): Promise<Map<string, number>> => {
  const counts = await prisma.comments.groupBy({
    by: ["parentId"],
    where: {
      parentId: { in: parentIds },
      ...(onlyApproved && { isApproved: true }),
    },
    _count: {
      id: true,
    },
  });

  const map = new Map<string, number>();
  counts.forEach((item) => {
    if (item.parentId) {
      map.set(item.parentId, item._count.id);
    }
  });

  return map;
};

export const create = async (userId: string, data: any) => {
  return prisma.comments.create({
    data: {
      userId,
      content: data.content,
      targetType: data.targetType,
      targetId: data.targetId,
      parentId: data.parentId,
      isApproved: false,
    },
    select: selectComment,
  });
};

export const update = async (id: string, data: any) => {
  return prisma.comments.update({
    where: { id },
    data,
    select: selectComment,
  });
};

export const remove = async (id: string) => {
  await prisma.comments.deleteMany({
    where: { parentId: id },
  });

  return prisma.comments.delete({
    where: { id },
  });
};

export const bulkApprove = async (commentIds: string[], isApproved: boolean) => {
  return prisma.comments.updateMany({
    where: { id: { in: commentIds } },
    data: { isApproved },
  });
};

export const validateParentComment = async (
  parentId: string,
  targetType: CommentTargetType,
  targetId: string,
): Promise<boolean> => {
  const parent = await prisma.comments.findUnique({
    where: { id: parentId },
    select: {
      targetType: true,
      targetId: true,
      parentId: true,
    },
  });

  if (!parent) return false;

  if (parent.targetType !== targetType || parent.targetId !== targetId) {
    return false;
  }

  if (parent.parentId !== null) {
    return false;
  }

  return true;
};

export const validateTarget = async (
  targetType: CommentTargetType,
  targetId: string,
): Promise<boolean> => {
  switch (targetType) {
    case CommentTargetType.BLOG:
      const blog = await prisma.blogs.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      return !!blog;

    case CommentTargetType.PRODUCT:
      const product = await prisma.products.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      return !!product;

    default:
      return false;
  }
};
