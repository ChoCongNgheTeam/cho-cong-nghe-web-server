import * as categoryRepository from "./category.repository";
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from "./category.validation";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";
import { deleteOldCategoryImage } from "./category.helpers";
import { NotFoundError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import prisma from "@/config/db";
import buildCategoryTree from "@/utils/build-category-tree";

export const getCategoriesPublic = async (query: ListCategoriesQuery) => {
  return categoryRepository.findAllPublic(query);
};

export const getCategoriesAdmin = async (query: ListCategoriesQuery) => {
  return categoryRepository.findAllAdmin(query);
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

export const getCategoryBySlug = async (slug: string, isAdmin: boolean = false) => {
  const category = await categoryRepository.findBySlug(slug, isAdmin);
  if (!category) throw new NotFoundError("Danh mục");
  return category;
};

export const getRootCategoriesForAdmin = async () => {
  return categoryRepository.findRootCategories(false);
};

export const getCategoryDetail = async (id: string, includeDeleted: boolean = false) => {
  const category = await categoryRepository.findById(id, includeDeleted);
  if (!category) throw new NotFoundError("Danh mục");
  return category;
};

export const createCategory = async (data: CreateCategoryInput) => {
  const slug = await generateUniqueSlug(prisma.categories, data.name);

  if (data.parentId) {
    const parent = await categoryRepository.findById(data.parentId);
    if (!parent) throw new BadRequestError("Danh mục cha không tồn tại");
  }

  const categoryData: any = {
    ...data,
    slug,
  };

  return categoryRepository.create(categoryData).catch(handlePrismaError);
};

export const updateCategory = async (id: string, data: UpdateCategoryInput) => {
  const existingCategory = await categoryRepository.findById(id);
  if (!existingCategory) throw new NotFoundError("Danh mục");

  const updateData: any = { ...data };

  if (data.name && data.name !== existingCategory.name) {
    updateData.slug = await generateUniqueSlug(prisma.categories, data.name);
  }

  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      throw new BadRequestError("Danh mục không thể là cha của chính nó");
    }
    if (data.parentId && data.parentId !== "") {
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw new BadRequestError("Danh mục cha không tồn tại");
    } else {
      updateData.parentId = null;
    }
  }

  if (data.imagePath && existingCategory.imagePath) {
    await deleteOldCategoryImage(existingCategory.imagePath);
  }

  if (data.removeImage && existingCategory.imagePath) {
    await deleteOldCategoryImage(existingCategory.imagePath);
    updateData.imagePath = null;
    updateData.imageUrl = null;
  }
  delete updateData.removeImage;

  return categoryRepository.update(id, updateData).catch(handlePrismaError);
};

export const softDeleteCategory = async (id: string, userId: string) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw new NotFoundError("Danh mục");

  const productCount = await categoryRepository.countProductsByCategoryId(id);
  if (productCount > 0) {
    throw new BadRequestError(`Không thể xóa vì đang có ${productCount} sản phẩm thuộc danh mục này`);
  }

  const subCount = await categoryRepository.countSubCategories(id);
  if (subCount > 0) {
    throw new BadRequestError(`Không thể xóa vì danh mục này đang chứa ${subCount} danh mục con`);
  }

  await categoryRepository.softDeleteCategory(id, userId);
};

export const restoreCategory = async (id: string) => {
  const category = await categoryRepository.findById(id, true);
  if (!category) throw new NotFoundError("Danh mục");
  if (!category.deletedAt) throw new BadRequestError("Danh mục này chưa bị xóa");

  return categoryRepository.restoreCategory(id);
};

export const hardDeleteCategory = async (id: string) => {
  const category = await categoryRepository.findById(id, true);
  if (!category) throw new NotFoundError("Danh mục");
  if (!category.deletedAt) throw new BadRequestError("Phải chuyển vào thùng rác trước khi xóa vĩnh viễn");

  if (category.imagePath) {
    await deleteOldCategoryImage(category.imagePath);
  }

  return await categoryRepository.hardDeleteCategory(id).catch(handlePrismaError);
};

export const getDeletedCategories = async (query: ListCategoriesQuery) => {
  return categoryRepository.findAllDeleted(query);
};

export const reorderCategory = async (categoryId: string, newPosition: number) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new NotFoundError("Danh mục");

  const siblings = await prisma.categories.findMany({
    where: { parentId: category.parentId, id: { not: categoryId }, deletedAt: null },
    orderBy: { position: "asc" },
  });

  siblings.splice(newPosition, 0, category);

  const updates = siblings.map((cat, index) => prisma.categories.update({ where: { id: cat.id }, data: { position: index } }));
  await prisma.$transaction(updates);

  return { message: "Sắp xếp thành công" };
};

export const getCategoryTemplate = async (categoryId: string) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new NotFoundError("Danh mục");

  const [attributes, specifications] = await Promise.all([
    categoryRepository.getCategoryVariantAttributes(categoryId), 
    categoryRepository.getCategorySpecifications(categoryId)
  ]);

  const attributesWithOptions = await Promise.all(
    attributes.map(async (attr) => ({
      ...attr,
      options: await categoryRepository.getAttributeOptions(attr.id),
    })),
  );

  return {
    category: { id: category.id, name: category.name, slug: category.slug },
    template: { attributes: attributesWithOptions, specifications },
  };
};

export const getAllAttributes = async () => categoryRepository.getAllAttributes();

export const getAttributeOptions = async (attributeId: string) => {
  const attribute = await prisma.attributes.findUnique({
    where: { id: attributeId },
    select: { id: true, code: true, name: true },
  });
  if (!attribute) throw new NotFoundError("Attribute");
  const options = await categoryRepository.getAttributeOptions(attributeId);
  return { attribute, options };
};

export const getAllSpecifications = async () => categoryRepository.getAllSpecifications();