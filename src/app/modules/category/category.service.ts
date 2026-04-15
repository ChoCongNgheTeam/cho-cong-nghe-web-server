import * as repo from "./category.repository";
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from "./category.validation";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";
import { deleteOldCategoryImage } from "./category.helpers";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import prisma from "@/config/db";
import buildCategoryTree from "@/utils/build-category-tree";

const assertCategoryExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const category = await repo.findById(id, options);
  if (!category) throw new NotFoundError("Danh mục");
  return category;
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────

export const getCategoriesPublic = async (query: ListCategoriesQuery) => {
  return repo.findAllPublic(query);
};

export const getRootCategories = async () => {
  return repo.findRootCategories(true);
};

export const resolveCategory = async (keyword: string) => {
  const q = keyword.trim();
  if (!q) return null;

  const { buildKeywordVariants, normalizeVietnamese } = await import("@/app/modules/search/search.helpers");

  const variants = buildKeywordVariants(q);
  const qNorm = normalizeVietnamese(q);

  // ── Helper: score category theo mức độ match ─────────────────────────────
  // Dùng để chọn category TỐT NHẤT khi có nhiều candidates
  // Score thấp hơn = tốt hơn
  const scoreCategory = (cat: { name: string; slug: string; parentId: string | null }): number => {
    const nameNorm = normalizeVietnamese(cat.name);
    const slugNorm = cat.slug.replace(/-/g, " ");

    if (nameNorm === qNorm || slugNorm === qNorm) return 0; // exact match
    if (nameNorm.startsWith(qNorm) || slugNorm.startsWith(qNorm)) return 1; // prefix
    if (cat.parentId === null) return 2; // root category
    return 3; // partial match
  };

  // ── Step 1: Tìm candidates với tất cả variants ────────────────────────────
  const orConditions = variants.flatMap((v) => [
    { slug: { equals: v, mode: "insensitive" as const } },
    { slug: { contains: v, mode: "insensitive" as const } },
    { name: { contains: v, mode: "insensitive" as const } },
  ]);

  const candidates = await prisma.categories.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      OR: orConditions,
    },
    orderBy: [
      { parentId: "asc" }, // null (root) lên trước
      { position: "asc" },
    ],
    select: { id: true, name: true, slug: true, parentId: true },
  });

  if (candidates.length > 0) {
    // Chọn candidate tốt nhất theo score
    const best = candidates.reduce((a, b) => (scoreCategory(a) <= scoreCategory(b) ? a : b));
    return best;
  }

  // ── Step 2: Tách từng word, thử tìm category khớp từng word ──────────────
  // Xử lý case "samsung galaxy", "iphone 17 pro", "laptop hp"...
  // → tách thành ["samsung", "galaxy"] → thử từng word → lấy word match tốt nhất
  const words = qNorm.split(/\s+/).filter((w) => w.length >= 3); // bỏ qua word quá ngắn ("hp" là exception, xử lý riêng)

  // Thêm lại words ngắn nếu query chỉ có 1 word (vd user nhập "hp")
  const searchWords = words.length > 0 ? words : qNorm.split(/\s+/).filter(Boolean);

  for (const word of searchWords) {
    const wordCandidates = await prisma.categories.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [{ slug: { contains: word, mode: "insensitive" } }, { name: { contains: word, mode: "insensitive" } }],
      },
      orderBy: [{ parentId: "asc" }, { position: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (wordCandidates.length > 0) {
      // Ưu tiên exact/prefix match
      const exactMatch = wordCandidates.find((c) => {
        const nameNorm = normalizeVietnamese(c.name);
        const slugNorm = c.slug.replace(/-/g, " ");
        return nameNorm === word || slugNorm === word || nameNorm.startsWith(word) || slugNorm.startsWith(word);
      });

      return exactMatch ?? wordCandidates[0];
    }
  }

  return null;
};

export const getFeaturedCategories = async (limit?: number) => {
  const categories = await repo.findFeaturedCategories(limit);
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    position: c.position,
  }));
};

export const getCategoryTree = async () => {
  const categories = await repo.findAllCategoriesForTree(true);
  return buildCategoryTree(categories);
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await repo.findBySlug(slug);
  if (!category) throw new NotFoundError("Danh mục");
  return category;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: LIST
// ─────────────────────────────────────────────────────────────────────────────

export const getCategoriesAdmin = async (query: ListCategoriesQuery) => {
  return repo.findAllAdmin(query);
};

export const getAllCategories = async () => {
  return repo.findAll(false);
};

export const getRootCategoriesForAdmin = async () => {
  return repo.findRootCategories(false);
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: DETAIL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getCategoryDetail
 *
 * Dùng findByIdWithRelations thay vì findAllCategoriesForTree để
 * trả về đầy đủ imageUrl, imagePath, description, timestamps, parent, children.
 */
export const getCategoryDetail = async (id: string, options: { isAdmin?: boolean } = {}) => {
  const category = await repo.findByIdWithRelations(id, {
    includeDeleted: options.isAdmin ?? true,
  });
  if (!category) throw new NotFoundError("Danh mục");
  return category;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: CREATE / UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export const createCategory = async (input: CreateCategoryInput) => {
  const { name, parentId, position, ...rest } = input;

  if (parentId) {
    const parent = await repo.findById(parentId);
    if (!parent) throw new NotFoundError("Danh mục cha");
  }

  const exists = await repo.existsByNameInParent(name, parentId || null);
  if (exists) throw new BadRequestError(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);

  const finalPosition = position ?? (await repo.countSiblings(parentId || null));
  const slug = await generateUniqueSlug(prisma.categories, name);

  return repo
    .create({
      name,
      slug,
      parent: parentId ? { connect: { id: parentId } } : undefined,
      position: finalPosition,
      ...rest,
    })
    .catch(handlePrismaError);
};

async function cascadeDeactivate(categoryId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await cascadeDeactivateTx(tx, categoryId);
  });
}

async function cascadeDeactivateTx(tx: any, categoryId: string): Promise<void> {
  const children = await tx.categories.findMany({
    where: { parentId: categoryId, deletedAt: null },
    select: { id: true },
  });

  for (const child of children) {
    await tx.categories.update({
      where: { id: child.id },
      data: { isActive: false },
    });
    await tx.products.updateMany({
      where: { categoryId: child.id, deletedAt: null },
      data: { isActive: false },
    });
    await cascadeDeactivateTx(tx, child.id);
  }

  // Ẩn products của chính category này
  await tx.products.updateMany({
    where: { categoryId, deletedAt: null },
    data: { isActive: false },
  });
}

async function cascadeActivate(categoryId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await cascadeActivateTx(tx, categoryId);
  });
}

async function cascadeActivateTx(tx: any, categoryId: string): Promise<void> {
  const children = await tx.categories.findMany({
    where: { parentId: categoryId, deletedAt: null },
    select: { id: true },
  });

  for (const child of children) {
    await tx.categories.update({
      where: { id: child.id },
      data: { isActive: true },
    });
    await tx.products.updateMany({
      where: { categoryId: child.id, deletedAt: null },
      data: { isActive: true },
    });
    await cascadeActivateTx(tx, child.id);
  }

  // Bật products của chính category này
  await tx.products.updateMany({
    where: { categoryId, deletedAt: null },
    data: { isActive: true },
  });
}

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  const { name, parentId, ...rest } = input;

  const category = await assertCategoryExists(id);

  if (parentId !== undefined) {
    if (parentId === id) throw new BadRequestError("Danh mục không thể là cha của chính nó");

    const isChangingParent = parentId !== (category as any).parentId;
    if (isChangingParent && parentId) {
      const parent = await repo.findById(parentId);
      if (!parent) throw new NotFoundError("Danh mục cha");

      const children = await repo.hasChildren(id);
      if (children) throw new BadRequestError("Không thể chuyển danh mục có danh mục con thành danh mục con");
    }
  }

  if (name) {
    const newParentId = parentId !== undefined ? parentId : (category as any).parentId;
    const exists = await repo.existsByNameInParent(name, newParentId, id);
    if (exists) throw new BadRequestError(`Tên danh mục "${name}" đã tồn tại trong cùng cấp`);
  }

  let slug = (category as any).slug;
  if (name && name !== (category as any).name) {
    slug = await generateUniqueSlug(prisma.categories, name);
  }

  if (input.imagePath && (category as any).imagePath) {
    await deleteOldCategoryImage((category as any).imagePath);
  }

  if (input.removeImage && (category as any).imagePath) {
    await deleteOldCategoryImage((category as any).imagePath);
    (rest as any).imagePath = null;
    (rest as any).imageUrl = null;
  }

  delete (rest as any).removeImage;

  const updated = await repo
    .update(id, {
      ...(name && { name, slug }),
      ...(parentId !== undefined && { parentId }),
      ...rest,
    })
    .catch(handlePrismaError);
  if (input.isActive === false) {
    await cascadeDeactivate(id);
  } else if (input.isActive === true) {
    await cascadeActivate(id);
  }

  return updated;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: DELETE / RESTORE / HARD DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const softDeleteCategory = async (id: string, deletedById: string) => {
  await assertCategoryExists(id);

  const children = await repo.hasChildren(id);
  if (children) throw new BadRequestError("Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.");

  const products = await repo.hasProducts(id);
  if (products) throw new BadRequestError("Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.");

  return repo.softDelete(id, deletedById);
};

export const restoreCategory = async (id: string) => {
  const category = (await repo.findById(id, {
    includeDeleted: true,
    isAdmin: true,
  })) as any;
  if (!category) throw new NotFoundError("Danh mục");
  if (!category.deletedAt) throw new BadRequestError("Danh mục này chưa bị xóa");

  const nameConflict = await repo.existsByNameInParent(category.name, category.parentId, id);
  if (nameConflict) throw new BadRequestError(`Không thể khôi phục vì tên "${category.name}" đã được dùng trong cùng cấp`);

  return repo.restore(id);
};

export const hardDeleteCategory = async (id: string) => {
  const category = (await repo.findById(id, {
    includeDeleted: true,
    isAdmin: true,
  })) as any;
  if (!category) throw new NotFoundError("Danh mục");

  if (!category.deletedAt) throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn. Dùng DELETE /admin/categories/:id");

  if (category.imagePath) await deleteOldCategoryImage(category.imagePath);

  return repo.hardDelete(id);
};

export const getDeletedCategories = async (options: { page?: number; limit?: number } = {}) => {
  return repo.findAllDeleted(options);
};

// ─────────────────────────────────────────────────────────────────────────────
// REORDER
// ─────────────────────────────────────────────────────────────────────────────

export const reorderCategory = async (categoryId: string, newPosition: number) => {
  const category = await assertCategoryExists(categoryId);
  const siblings = await repo.findSiblings((category as any).parentId);

  if (newPosition < 0 || newPosition >= siblings.length) throw new BadRequestError("Vị trí không hợp lệ");

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

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE / ATTRIBUTES / SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getCategoryTemplate = async (categoryId: string) => {
  const category = await assertCategoryExists(categoryId);

  const [attributes, specifications] = await Promise.all([repo.getCategoryVariantAttributes(categoryId), repo.getCategorySpecifications(categoryId)]);

  const attributesWithOptions = await Promise.all(
    attributes.map(async (attr) => ({
      ...attr,
      options: await repo.getAttributeOptions(attr.id),
    })),
  );

  return {
    category: {
      id: (category as any).id,
      name: (category as any).name,
      slug: (category as any).slug,
    },
    template: { attributes: attributesWithOptions, specifications },
  };
};

export const getAllAttributes = async () => repo.getAllAttributes();

export const getAttributeOptions = async (attributeId: string) => {
  const attribute = await prisma.attributes.findUnique({
    where: { id: attributeId },
    select: { id: true, code: true, name: true },
  });
  if (!attribute) throw new NotFoundError("Attribute");

  const options = await repo.getAttributeOptions(attributeId);
  return { attribute, options };
};

export const getAllSpecifications = async () => repo.getAllSpecifications();
