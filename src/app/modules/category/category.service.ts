import * as categoryRepository from "./category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.validation";
import { Prisma } from "@prisma/client";
import { DuplicateError, NotFoundError, BadRequestError } from "@/utils/errors";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";
import prisma from "@/config/db";
import buildCategoryTree from "@/utils/build-category-tree";

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

// 2. Lấy category tree cho menu
export const getCategoryTree = async () => {
  const categories = await categoryRepository.findAllCategoriesForTree(true);
  return buildCategoryTree(categories);
};

// Lấy category theo slug (public)
export const getCategoryBySlug = async (slug: string) => {
  const category = await categoryRepository.findBySlug(slug);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }
  return category;
};

// === ADMIN SERVICES ===

// Lấy tất cả categories (admin)
export const getAllCategories = async () => {
  return categoryRepository.findAll(false);
};

// Lấy root categories với số lượng sub (admin)
export const getRootCategoriesForAdmin = async () => {
  return categoryRepository.findRootCategories(false);
};

// Lấy category detail với children (admin)
export const getCategoryDetail = async (id: string) => {
  // admin → lấy cả inactive
  const categories = await categoryRepository.findAllCategoriesForTree(false);

  const current = categories.find((c) => c.id === id);
  if (!current) {
    throw new NotFoundError("Danh mục");
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

// Tạo category
export const createCategory = async (input: CreateCategoryInput) => {
  const { name, parentId, position, ...rest } = input;

  // Validate parent nếu có
  if (parentId) {
    const parent = await categoryRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundError("Danh mục cha");
    }
  }

  // Check duplicate name trong cùng parent
  const exists = await categoryRepository.existsByNameInParent(name, parentId || null);
  if (exists) {
    throw new DuplicateError(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
  }

  // Tính position nếu không được cung cấp
  let finalPosition = position;
  if (finalPosition === undefined) {
    finalPosition = await categoryRepository.countSiblings(parentId || null);
  }

  // Generate slug
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
      throw new DuplicateError("Slug danh mục");
    }
    throw error;
  }
};

// Update category
export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  const { name, parentId, ...rest } = input;

  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }

  // Validate parent nếu có
  if (parentId !== undefined) {
    if (parentId === id) {
      throw new BadRequestError("Danh mục không thể là cha của chính nó");
    }

    // CHỈ kiểm tra khi parentId THAY ĐỔI
    const isChangingParent = parentId !== category.parentId;

    if (isChangingParent && parentId) {
      const parent = await categoryRepository.findById(parentId);
      if (!parent) {
        throw new NotFoundError("Danh mục cha");
      }

      const hasChildren = await categoryRepository.hasChildren(id);
      if (hasChildren) {
        throw new BadRequestError("Không thể chuyển danh mục có danh mục con thành danh mục con");
      }
    }
  }

  // Check duplicate name nếu có thay đổi
  if (name) {
    const newParentId = parentId !== undefined ? parentId : category.parentId;
    const exists = await categoryRepository.existsByNameInParent(name, newParentId, id);
    if (exists) {
      throw new DuplicateError(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
    }
  }

  // Generate new slug nếu name thay đổi
  let slug = category.slug;
  if (name && name !== category.name) {
    slug = await generateUniqueSlug(prisma.categories, name);
  }

  try {
    return await categoryRepository.update(id, {
      ...(name && { name, slug }),
      ...(parentId !== undefined && { parentId }),
      ...rest,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new DuplicateError("Slug danh mục");
    }
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }

  // Check có children không
  const hasChildren = await categoryRepository.hasChildren(id);
  if (hasChildren) {
    throw new BadRequestError(
      "Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.",
    );
  }

  // Check có products không
  const hasProducts = await categoryRepository.hasProducts(id);
  if (hasProducts) {
    throw new BadRequestError(
      "Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.",
    );
  }

  return categoryRepository.remove(id);
};

// Reorder category
export const reorderCategory = async (categoryId: string, newPosition: number) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }

  const siblings = await categoryRepository.findSiblings(category.parentId);

  if (newPosition < 0 || newPosition >= siblings.length) {
    throw new BadRequestError("Vị trí không hợp lệ");
  }

  // Reorder logic
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
