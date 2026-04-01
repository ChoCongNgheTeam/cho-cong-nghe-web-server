import { NotFoundError, BadRequestError } from "@/errors";
import { findAllCategoriesWithAttributes, findCategoryWithAttributes, setCategoryAttributes, findAllAttributes } from "./category-variant-attribute.repository";
import { SetCategoryAttributesPayload } from "./category-variant-attribute.types";

const formatCategory = (cat: any) => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
  parentId: cat.parentId,
  isActive: cat.isActive,
  attributes: cat.variantAttributes.map((va: any) => va.attribute),
});

/** GET /category-variant-attributes */
export const getAllCategoriesWithAttributes = async () => {
  const rows = await findAllCategoriesWithAttributes();
  return rows.map(formatCategory);
};

/** GET /category-variant-attributes/attributes */
export const getAttributeOptions = async () => {
  return findAllAttributes();
};

/** GET /category-variant-attributes/:categoryId */
export const getCategoryAttributes = async (categoryId: string) => {
  const cat = await findCategoryWithAttributes(categoryId);
  if (!cat) throw new NotFoundError("Category không tồn tại");
  return formatCategory(cat);
};

/** PUT /category-variant-attributes/:categoryId */
export const updateCategoryAttributes = async (categoryId: string, payload: SetCategoryAttributesPayload) => {
  const cat = await findCategoryWithAttributes(categoryId);
  if (!cat) throw new NotFoundError("Category không tồn tại");

  if (!Array.isArray(payload.attributeIds)) {
    throw new BadRequestError("attributeIds phải là mảng");
  }

  await setCategoryAttributes(categoryId, payload.attributeIds);

  // Trả về category đã được cập nhật
  const updated = await findCategoryWithAttributes(categoryId);
  return formatCategory(updated);
};
