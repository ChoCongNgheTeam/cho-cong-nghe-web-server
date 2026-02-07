import * as categoryRepository from "./category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.validation";
import { Prisma } from "@prisma/client";
import { DuplicateError, NotFoundError, BadRequestError } from "@/utils/errors";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";
import prisma from "@/config/db";
import buildCategoryTree from "@/utils/build-category-tree";

// =====================
// === EXISTING CODE ===
// =====================

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
    throw new NotFoundError("Danh mục");
  }
  return category;
};

// === ADMIN SERVICES ===

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

export const createCategory = async (input: CreateCategoryInput) => {
  const { name, parentId, position, ...rest } = input;

  if (parentId) {
    const parent = await categoryRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundError("Danh mục cha");
    }
  }

  const exists = await categoryRepository.existsByNameInParent(name, parentId || null);
  if (exists) {
    throw new DuplicateError(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
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
      throw new DuplicateError("Slug danh mục");
    }
    throw error;
  }
};

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  const { name, parentId, ...rest } = input;

  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }

  if (parentId !== undefined) {
    if (parentId === id) {
      throw new BadRequestError("Danh mục không thể là cha của chính nó");
    }

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

  if (name) {
    const newParentId = parentId !== undefined ? parentId : category.parentId;
    const exists = await categoryRepository.existsByNameInParent(name, newParentId, id);
    if (exists) {
      throw new DuplicateError(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
    }
  }

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

export const deleteCategory = async (id: string) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }

  const hasChildren = await categoryRepository.hasChildren(id);
  if (hasChildren) {
    throw new BadRequestError(
      "Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.",
    );
  }

  const hasProducts = await categoryRepository.hasProducts(id);
  if (hasProducts) {
    throw new BadRequestError(
      "Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.",
    );
  }

  return categoryRepository.remove(id);
};

export const reorderCategory = async (categoryId: string, newPosition: number) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Danh mục");
  }

  const siblings = await categoryRepository.findSiblings(category.parentId);

  if (newPosition < 0 || newPosition >= siblings.length) {
    throw new BadRequestError("Vị trí không hợp lệ");
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
    throw new NotFoundError("Danh mục");
  }

  const [attributes, specifications] = await Promise.all([
    categoryRepository.getCategoryVariantAttributes(categoryId),
    categoryRepository.getCategorySpecifications(categoryId),
  ]);

  // Lấy options cho mỗi attribute
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

/**
 * Lấy tất cả attributes (cho dropdown custom)
 */
export const getAllAttributes = async () => {
  return categoryRepository.getAllAttributes();
};

/**
 * Lấy options cho attribute
 */
export const getAttributeOptions = async (attributeId: string) => {
  const attribute = await prisma.attributes.findUnique({
    where: { id: attributeId },
    select: { id: true, code: true, name: true },
  });

  if (!attribute) {
    throw new NotFoundError("Attribute");
  }

  const options = await categoryRepository.getAttributeOptions(attributeId);

  return {
    attribute,
    options,
  };
};

/**
 * Lấy tất cả specifications (cho dropdown custom)
 */
export const getAllSpecifications = async () => {
  return categoryRepository.getAllSpecifications();
};
