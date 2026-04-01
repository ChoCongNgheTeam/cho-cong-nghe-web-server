// Dùng chung cho controller/service/repository
export interface CategoryWithAttributes {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  attributes: {
    id: string;
    code: string;
    name: string;
  }[];
}

export interface SetCategoryAttributesPayload {
  attributeIds: string[]; // danh sách attributeId muốn set (replace toàn bộ)
}
