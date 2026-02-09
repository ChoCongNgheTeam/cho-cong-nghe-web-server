import * as categoryRepository from "./category.repository";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from "./category.validation";
import { Prisma } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";
import { deleteOldCategoryImage } from "./category.helpers";
import prisma from "@/config/db";
import buildCategoryTree from "@/utils/build-category-tree";

export const getCategoriesPublic = async (query: ListCategoriesQuery) => {
  return await categoryRepository.findAllPublic(query);
};

export const getCategoriesAdmin = async (query: ListCategoriesQuery) => {
  return await categoryRepository.findAllAdmin(query);
};

export const getRootCategories = async () => {
  return categoryRepository.findRootCategories(true);
};

export const getFeaturedCategories = async (limit?: number) => {
  const categories = await categoryRepository.findFeaturedCategories(limit);

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    position: c.position,
  }));
};

export const getCategoryTree = async () => {
  const categories = await categoryRepository.findAllCategoriesForTree(true);
  return buildCategoryTree(categories);
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await categoryRepository.findBySlug(slug);
  if (!category) {
    const error: any = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }
  return category;
};

export const getAllCategories = async () => {
  return categoryRepository.findAll(false);
};

export const getRootCategoriesForAdmin = async () => {
  return categoryRepository.findRootCategories(false);
};

export const getCategoryDetail = async (id: string) => {
  const categories = await categoryRepository.findAllCategoriesForTree(false);

  const current = categories.find((c) => c.id === id);
  if (!current) {
    const error: any = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  const childrenTree = buildCategoryTree(categories, id);

  const parent = current.parentId
    ? (categories.find((c) => c.id === current.parentId) ?? null)
    : null;

  return {
    ...current,
    parent,
    children: childrenTree,
  };
};

export const createCategory = async (input: CreateCategoryInput) => {
  const { name, parentId, position, ...rest } = input;

  if (parentId) {
    const parent = await categoryRepository.findById(parentId);
    if (!parent) {
      const error: any = new Error("Không tìm thấy danh mục cha");
      error.statusCode = 404;
      throw error;
    }
  }

  const exists = await categoryRepository.existsByNameInParent(name, parentId || null);
  if (exists) {
    const error: any = new Error(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
    error.statusCode = 400;
    throw error;
  }

  let finalPosition = position;
  if (finalPosition === undefined) {
    finalPosition = await categoryRepository.countSiblings(parentId || null);
  }

  const slug = await generateUniqueSlug(prisma.categories, name);

  try {
    return await categoryRepository.create({
      name,
      slug,
      parent: parentId ? { connect: { id: parentId } } : undefined,
      position: finalPosition,
      ...rest,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const err: any = new Error("Slug danh mục đã tồn tại");
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
};

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  const { name, parentId, ...rest } = input;

  const category = await categoryRepository.findById(id);
  if (!category) {
    const error: any = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  if (parentId !== undefined) {
    if (parentId === id) {
      const error: any = new Error("Danh mục không thể là cha của chính nó");
      error.statusCode = 400;
      throw error;
    }

    const isChangingParent = parentId !== category.parentId;

    if (isChangingParent && parentId) {
      const parent = await categoryRepository.findById(parentId);
      if (!parent) {
        const error: any = new Error("Không tìm thấy danh mục cha");
        error.statusCode = 404;
        throw error;
      }

      const hasChildren = await categoryRepository.hasChildren(id);
      if (hasChildren) {
        const error: any = new Error(
          "Không thể chuyển danh mục có danh mục con thành danh mục con",
        );
        error.statusCode = 400;
        throw error;
      }
    }
  }

  if (name) {
    const newParentId = parentId !== undefined ? parentId : category.parentId;
    const exists = await categoryRepository.existsByNameInParent(name, newParentId, id);
    if (exists) {
      const error: any = new Error(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
      error.statusCode = 400;
      throw error;
    }
  }

  let slug = category.slug;
  if (name && name !== category.name) {
    slug = await generateUniqueSlug(prisma.categories, name);
  }

  if (input.imagePath && category.imagePath) {
    await deleteOldCategoryImage(category.imagePath);
  }

  if (input.removeImage && category.imagePath) {
    await deleteOldCategoryImage(category.imagePath);
    (rest as any).imagePath = null;
    (rest as any).imageUrl = null;
  }

  try {
    return await categoryRepository.update(id, {
      ...(name && { name, slug }),
      ...(parentId !== undefined && { parentId }),
      ...rest,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const err: any = new Error("Slug danh mục đã tồn tại");
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    const error: any = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  const hasChildren = await categoryRepository.hasChildren(id);
  if (hasChildren) {
    const error: any = new Error(
      "Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.",
    );
    error.statusCode = 400;
    throw error;
  }

  const hasProducts = await categoryRepository.hasProducts(id);
  if (hasProducts) {
    const error: any = new Error(
      "Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (category.imagePath) {
    await deleteOldCategoryImage(category.imagePath);
  }

  return categoryRepository.remove(id);
};

export const reorderCategory = async (categoryId: string, newPosition: number) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    const error: any = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  const siblings = await categoryRepository.findSiblings(category.parentId);

  if (newPosition < 0 || newPosition >= siblings.length) {
    const error: any = new Error("Vị trí không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const updates = siblings
    .filter((s) => s.id !== categoryId)
    .map((sibling, index) => {
      const pos = index >= newPosition ? index + 1 : index;
      return prisma.categories.update({
        where: { id: sibling.id },
        data: { position: pos },
      });
    });

  updates.push(
    prisma.categories.update({
      where: { id: categoryId },
      data: { position: newPosition },
    }),
  );

  await prisma.$transaction(updates);

  return { message: "Sắp xếp thành công" };
};

export const getCategoryTemplate = async (categoryId: string) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    const error: any = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  const [attributes, specifications] = await Promise.all([
    categoryRepository.getCategoryVariantAttributes(categoryId),
    categoryRepository.getCategorySpecifications(categoryId),
  ]);

  const attributesWithOptions = await Promise.all(
    attributes.map(async (attr) => {
      const options = await categoryRepository.getAttributeOptions(attr.id);
      return {
        ...attr,
        options,
      };
    }),
  );

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    template: {
      attributes: attributesWithOptions,
      specifications,
    },
  };
};

export const getAllAttributes = async () => {
  return categoryRepository.getAllAttributes();
};

export const getAttributeOptions = async (attributeId: string) => {
  const attribute = await prisma.attributes.findUnique({
    where: { id: attributeId },
    select: { id: true, code: true, name: true },
  });

  if (!attribute) {
    const error: any = new Error("Không tìm thấy attribute");
    error.statusCode = 404;
    throw error;
  }

  const options = await categoryRepository.getAttributeOptions(attributeId);

  return {
    attribute,
    options,
  };
};

export const getAllSpecifications = async () => {
  return categoryRepository.getAllSpecifications();
};
