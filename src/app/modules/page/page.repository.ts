import prisma from "@/config/db";

export const findBySlugPublic = async (slug: string) => {
  return prisma.pages.findFirst({
    where: {
      slug,
      isPublished: true,
      deletedAt: null, // Đảm bảo không lấy trang đã bị xóa mềm vào thùng rác
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