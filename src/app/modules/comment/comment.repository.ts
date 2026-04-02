import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListCommentsQuery } from "./comment.validation";
import { CommentTargetType } from "./comment.types";

export interface FindCommentsParams {
  page?: number;
  limit?: number;
  targetType?: CommentTargetType;
  targetId?: string;
  isApproved?: boolean;
  /** null = chỉ lấy top-level, undefined = lấy tất cả */
  parentId?: string | null;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  avatarImage: true,
} satisfies Prisma.usersSelect;

//  Select Fields

const selectUser = {
  id: true,
  fullName: true,
  email: true,
  avatarImage: true,
};

/**
 * Select public — không expose soft delete metadata
 */
const selectComment = {
  id: true,
  userId: true,
  content: true,
  targetType: true,
  targetId: true,
  parentId: true,
  isApproved: true,
  createdAt: true,
  user: { select: selectUser },
} satisfies Prisma.commentsSelect;

/**
 * Select admin — thêm soft delete metadata
 */
const selectCommentAdmin = {
  ...selectComment,
  deletedAt: true,
  deletedBy: true,
} satisfies Prisma.commentsSelect;

// ── Target name resolver ──────────────────────────────────────────────────────

/**
 * Batch-lookup tên blog / product từ danh sách comment.
 * Chỉ tốn 2 SQL phụ (song song) dù có bao nhiêu comment trên trang.
 *
 * @returns Map<targetId, targetName>
 */
const resolveTargetNames = async (rows: Array<{ targetType: string; targetId: string }>): Promise<Map<string, string>> => {
  const blogIds: string[] = [];
  const productIds: string[] = [];

  for (const row of rows) {
    if (row.targetType === CommentTargetType.BLOG) blogIds.push(row.targetId);
    else if (row.targetType === CommentTargetType.PRODUCT) productIds.push(row.targetId);
    // PAGE không có bảng tương ứng — bỏ qua
  }

  const [blogs, products] = await Promise.all([
    blogIds.length
      ? prisma.blogs.findMany({
          where: { id: { in: blogIds } },
          select: { id: true, title: true },
        })
      : [],
    productIds.length
      ? prisma.products.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [],
  ]);

  const map = new Map<string, string>();
  for (const b of blogs) map.set(b.id, b.title);
  for (const p of products) map.set(p.id, p.name);
  return map;
};

//  Query Builder

const buildCommentWhere = (query: ListCommentsQuery, onlyApproved: boolean, isAdmin: boolean): Prisma.commentsWhereInput => {
  const where: Prisma.commentsWhereInput = {};

  // Soft delete filter:
  // - Public / Staff: chỉ thấy comment chưa xóa
  // - Admin + includeDeleted=true: thấy tất cả kể cả đã xóa
  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  if (onlyApproved) {
    where.isApproved = true;
  } else if (query.isApproved !== undefined) {
    where.isApproved = query.isApproved;
  }

  if (query.targetType) where.targetType = query.targetType;
  if (query.targetId) where.targetId = query.targetId;
  if (query.parentId !== undefined) where.parentId = query.parentId;

  if (query.search) {
    where.content = {
      contains: query.search,
      mode: "insensitive",
    };
  }

  return where;
};

//  Queries ──

export const findAllPublic = async (query: ListCommentsQuery) => {
  return _findAll(query, { onlyApproved: true, isAdmin: false });
};

/**
 * Admin list — inject targetName vào mỗi comment để hiển thị tên blog/sản phẩm
 */
export const findAllAdmin = async (query: ListCommentsQuery) => {
  const result = await _findAll(query, { onlyApproved: false, isAdmin: true });

  // Batch resolve tên — không N+1
  const nameMap = await resolveTargetNames(result.data);
  const data = result.data.map((c) => ({
    ...c,
    targetName: nameMap.get(c.targetId) ?? null,
  }));

  return { ...result, data };
};

const _findAll = async (query: ListCommentsQuery, options: { onlyApproved: boolean; isAdmin: boolean }) => {
  const { page, limit, sortBy, sortOrder } = query;
  const { onlyApproved, isAdmin } = options;
  const skip = (page - 1) * limit;

  const where = buildCommentWhere(query, onlyApproved, isAdmin);
  const orderBy: Prisma.commentsOrderByWithRelationInput = { [sortBy]: sortOrder };
  const select = isAdmin ? selectCommentAdmin : selectComment;

  const [data, total] = await prisma.$transaction([prisma.comments.findMany({ where, select, orderBy, skip, take: limit }), prisma.comments.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/**
 * Tìm theo id.
 * - Mặc định: bỏ qua comment đã soft delete.
 * - Admin + includeDeleted=true: tìm cả trong trash.
 * - isAdmin=true: inject targetName vào kết quả.
 */
export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;

  const comment = await prisma.comments.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectCommentAdmin : selectComment,
  });

  if (!comment || !isAdmin) return comment;

  // Inject targetName cho admin detail view
  const nameMap = await resolveTargetNames([comment]);
  return { ...comment, targetName: nameMap.get(comment.targetId) ?? null };
};

/**
 * findByTarget — public, chỉ lấy comment chưa xóa, đã approved
 * replies cũng filter deletedAt: null
 */
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
    deletedAt: null, // luôn loại comment đã xóa
    ...(onlyApproved && { isApproved: true }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.comments.findMany({
      where,
      select: {
        ...selectComment,
        ...(includeReplies && {
          replies: {
            where: {
              deletedAt: null, // replies cũng filter deleted
              ...(onlyApproved ? { isApproved: true } : {}),
            },
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

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/**
 * Đếm comments theo targetIds — chỉ đếm comment chưa xóa
 */
export const getCommentsCountByTargets = async (targetType: CommentTargetType, targetIds: string[], onlyApproved = true): Promise<Map<string, number>> => {
  const counts = await prisma.comments.groupBy({
    by: ["targetId"],
    where: {
      targetType,
      targetId: { in: targetIds },
      deletedAt: null,
      ...(onlyApproved && { isApproved: true }),
    },
    _count: { id: true },
  });

  const map = new Map<string, number>();
  counts.forEach((item) => map.set(item.targetId, item._count.id));
  return map;
};

/**
 * findReplies — chỉ lấy reply chưa xóa
 */
export const findReplies = async (parentId: string, onlyApproved = true) => {
  return prisma.comments.findMany({
    where: {
      parentId,
      deletedAt: null,
      ...(onlyApproved && { isApproved: true }),
    },
    select: selectComment,
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Đếm replies theo parentIds — chỉ đếm reply chưa xóa
 */
export const getRepliesCountByParentIds = async (parentIds: string[], onlyApproved = true): Promise<Map<string, number>> => {
  const counts = await prisma.comments.groupBy({
    by: ["parentId"],
    where: {
      parentId: { in: parentIds },
      deletedAt: null,
      ...(onlyApproved && { isApproved: true }),
    },
    _count: { id: true },
  });

  const map = new Map<string, number>();
  counts.forEach((item) => {
    if (item.parentId) map.set(item.parentId, item._count.id);
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
      parentId: data.parentId ?? null,
      isApproved: false,
    },
    select: selectComment,
  });
};

/**
 * update — chỉ update comment chưa bị soft delete
 */
export const update = async (id: string, data: Prisma.commentsUpdateInput) => {
  return prisma.comments.update({
    where: { id, deletedAt: null },
    data,
    select: selectComment,
  });
};

/**
 * Soft delete — Staff & Admin.
 * deletedBy: audit log.
 * Replies cũng bị soft delete theo (cascade soft).
 */
export const softDelete = async (id: string, deletedById: string) => {
  // Soft delete replies trước
  await prisma.comments.updateMany({
    where: { parentId: id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });

  return prisma.comments.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });
};

/**
 * Restore comment từ trash — Admin only.
 * Replies KHÔNG tự restore vì admin cần review từng cái.
 */
export const restore = async (id: string) => {
  return prisma.comments.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectCommentAdmin,
  });
};

/**
 * Hard delete — Admin only, CHỈ sau khi đã soft delete.
 * Hard delete replies trước để tránh FK constraint.
 */
export const hardDelete = async (id: string) => {
  await prisma.comments.deleteMany({ where: { parentId: id } });
  return prisma.comments.delete({ where: { id } });
};

/**
 * Soft delete của chính user — chỉ soft delete comment của mình,
 * không xóa replies (replies vẫn hiện nhưng parent bị ẩn).
 * Lý do: user không nên "kéo theo" replies của người khác.
 */
export const softDeleteOwn = async (id: string, deletedById: string) => {
  return prisma.comments.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });
};

export const bulkApprove = async (commentIds: string[], isApproved: boolean) => {
  return prisma.comments.updateMany({
    where: { id: { in: commentIds }, deletedAt: null },
    data: { isApproved },
  });
};

/**
 * Bulk soft delete — Staff & Admin
 */
export const bulkSoftDelete = async (ids: string[], deletedById: string) => {
  // Soft delete replies của tất cả comment được chọn
  await prisma.comments.updateMany({
    where: { parentId: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });

  return prisma.comments.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById },
  });
};

/**
 * Bulk restore — Admin only
 */
export const bulkRestore = async (ids: string[]) => {
  return prisma.comments.updateMany({
    where: { id: { in: ids }, deletedAt: { not: null } },
    data: { deletedAt: null, deletedBy: null },
  });
};

/**
 * Lấy danh sách comment đã soft delete — Admin only (trang trash)
 */
export const findAllDeleted = async (options: Pick<ListCommentsQuery, "page" | "limit">) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.comments.findMany({
      where: { deletedAt: { not: null } },
      select: selectCommentAdmin,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.comments.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

//  Validation helpers

/**
 * validateParentComment — chỉ validate parent chưa bị soft delete,
 * chưa là reply (parentId = null), cùng target.
 */
export const validateParentComment = async (parentId: string, targetType: CommentTargetType, targetId: string): Promise<boolean> => {
  const parent = await prisma.comments.findFirst({
    where: { id: parentId, deletedAt: null }, // không reply vào comment đã xóa
    select: { targetType: true, targetId: true, parentId: true },
  });

  if (!parent) return false;
  if (parent.targetType !== targetType || parent.targetId !== targetId) return false;
  if (parent.parentId !== null) return false; // không cho reply lồng quá 1 cấp

  return true;
};

/**
 * validateTarget — kiểm tra target chưa bị soft delete
 */
export const validateTarget = async (targetType: CommentTargetType, targetId: string): Promise<boolean> => {
  switch (targetType) {
    case CommentTargetType.BLOG: {
      const blog = await prisma.blogs.findFirst({
        where: { id: targetId, deletedAt: null },
        select: { id: true },
      });
      return !!blog;
    }
    case CommentTargetType.PRODUCT: {
      const product = await prisma.products.findFirst({
        where: { id: targetId, deletedAt: null },
        select: { id: true },
      });
      return !!product;
    }
    default:
      return false;
  }
};
