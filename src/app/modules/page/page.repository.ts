import prisma from "@/config/db";
import { ListPagesQuery } from "./page.validation";
import { AdminListPagesQuery, CreatePageInput, UpdatePageInput } from "./page.validation";

export const findBySlugPublic = async (slug: string) => {
  return prisma.pages.findFirst({
    where: {
      slug,
      isPublished: true,
      deletedAt: null, 
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      type: true,
      policyType: true,
      updatedAt: true,
    },
  });
};
export const findAllPublic = async (query: ListPagesQuery) => {
  return prisma.pages.findMany({
    where: {
      isPublished: true,
      deletedAt: null, // Không lấy trang đã xóa mềm
      ...(query.type && { type: query.type }), // Lọc theo type nếu có
      ...(query.policyType && { policyType: query.policyType }), // Lọc theo policyType nếu có
    },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      policyType: true,
      priority: true, // Lấy ra để biết thứ tự
      updatedAt: true,
      // TỐI ƯU: Cố tình không select `content` để API phản hồi cực nhanh
    },
    orderBy: {
      priority: 'asc', // Sắp xếp ưu tiên: 0, 1, 2, 3...
    },
  });
};

// Lấy danh sách cho Admin (Có phân trang, search)
export const findAllAdmin = async (query: AdminListPagesQuery) => {
  const { page, limit, keyword, type, isPublished } = query;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    deletedAt: null,
    ...(type && { type }),
    ...(isPublished !== undefined && { isPublished }),
    ...(keyword && {
      title: { contains: keyword, mode: "insensitive" } // Tìm kiếm không phân biệt hoa thường
    }),
  };

  const [total, pages] = await Promise.all([
    prisma.pages.count({ where: whereCondition }),
    prisma.pages.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // Mới nhất lên đầu
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        policyType: true,
        isPublished: true,
        priority: true,
        createdAt: true,
      },
    }),
  ]);

  return { total, pages, page, limit };
};

// Tìm theo ID
export const findById = async (id: string) => {
  return prisma.pages.findUnique({ where: { id, deletedAt: null } });
};

// Check trùng Slug
export const checkSlugExists = async (slug: string, excludeId?: string) => {
  const count = await prisma.pages.count({
    where: { 
      slug, 
      ...(excludeId && { id: { not: excludeId } }) 
    }
  });
  return count > 0;
};

// Tạo mới
export const create = async (data: CreatePageInput) => {
  return prisma.pages.create({ data });
};

// Cập nhật
export const update = async (id: string, data: UpdatePageInput) => {
  return prisma.pages.update({ where: { id }, data });
};

// Xóa mềm (Soft Delete)
export const softDelete = async (id: string, deletedBy: string) => {
  return prisma.pages.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
  });
};

// BỔ SUNG: 1. Lấy danh sách Thùng rác (Chỉ lấy các trang đã bị xóa mềm)
export const findTrashAdmin = async (query: AdminListPagesQuery) => {
  const { page, limit, keyword, type } = query;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    deletedAt: { not: null }, // Điều kiện: Đã bị xóa
    ...(type && { type }),
    ...(keyword && {
      title: { contains: keyword, mode: "insensitive" }
    }),
  };

  const [total, pages] = await Promise.all([
    prisma.pages.count({ where: whereCondition }),
    prisma.pages.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { deletedAt: "desc" }, // Xóa gần nhất lên đầu
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        deletedAt: true,
        // Có thể join thêm user nếu bảng Pages của bạn có relation với User qua deletedBy
      },
    }),
  ]);

  return { total, pages, page, limit };
};

// BỔ SUNG: 2. Tìm trang (bao gồm cả trong thùng rác)
export const findByIdWithTrash = async (id: string) => {
  return prisma.pages.findUnique({ where: { id } });
};

// BỔ SUNG: 3. Khôi phục trang
export const restore = async (id: string) => {
  return prisma.pages.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
  });
};

// BỔ SUNG: 4. Xóa vĩnh viễn (Hard Delete)
export const hardDelete = async (id: string) => {
  return prisma.pages.delete({ where: { id } });
};

// BỔ SUNG: 5. Đổi trạng thái nhanh
export const changeStatus = async (id: string, isPublished: boolean) => {
  return prisma.pages.update({
    where: { id },
    data: { isPublished },
  });
};