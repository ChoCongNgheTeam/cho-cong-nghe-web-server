import { Prisma } from "@prisma/client";
import prisma from "@/config/db";
import { uploadImage, deleteImage } from "@/integrations/cloudinary.service";

export const parseMultipartData = (body: any): any => {
  let data = { ...body };

  if (body.data && typeof body.data === "string") {
    try {
      const parsedData = JSON.parse(body.data);
      data = { ...data, ...parsedData };
      delete data.data;
    } catch (e) {
      throw new Error("Invalid JSON format in 'data' field");
    }
  }

  const booleanFields = ["isFeatured", "isActive", "removeImage"];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        data[field] = data[field].toLowerCase() === "true";
      }
    }
  });

  if (data.position !== undefined && typeof data.position === "string") {
    data.position = parseInt(data.position, 10);
  }

  return data;
};

export const uploadCategoryImage = async (file: Express.Multer.File) => {
  if (!file) return null;

  const result = await uploadImage(file.path, "categories");

  return {
    publicId: result.publicId,
    url: result.url,
  };
};

export const deleteOldCategoryImage = async (imagePath?: string) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting old category image:", error);
    }
  }
};

// CASCADE: bật/tắt isActive cho toàn bộ cây con khi danh mục cha đổi trạng thái

async function collectDescendantIds(tx: Prisma.TransactionClient, rootId: string): Promise<string[]> {
  const allIds: string[] = [];
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await tx.categories.findMany({
      where: { parentId: currentId, deletedAt: null },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);
    allIds.push(...childIds);
    queue.push(...childIds);
  }

  return allIds; // không bao gồm rootId
}

export async function cascadeDeactivate(categoryId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const descendantIds = await collectDescendantIds(tx, categoryId);
    const allIds = [categoryId, ...descendantIds];

    await tx.categories.updateMany({
      where: { id: { in: allIds } },
      data: { isActive: false },
    });
    await tx.products.updateMany({
      where: { categoryId: { in: allIds }, deletedAt: null },
      data: { isActive: false },
    });
  });
}

export async function cascadeActivate(categoryId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const descendantIds = await collectDescendantIds(tx, categoryId);
    const allIds = [categoryId, ...descendantIds];

    await tx.categories.updateMany({
      where: { id: { in: allIds } },
      data: { isActive: true },
    });
    await tx.products.updateMany({
      where: { categoryId: { in: allIds }, deletedAt: null },
      data: { isActive: true },
    });
  });
}
