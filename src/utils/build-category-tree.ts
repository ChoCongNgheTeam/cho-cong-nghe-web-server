import { CategoryNode, CategoryRow } from "@/types/category.types";

const buildCategoryTree = (
  categories: CategoryRow[],
  parentId: string | null = null,
  visited = new Set<string>()
): CategoryNode[] => {
  return categories
    .filter((c) => c.parentId === parentId)
    .map((c) => {
      if (visited.has(c.id)) return null;
      visited.add(c.id);

      return {
        ...c,
        children: buildCategoryTree(categories, c.id, visited),
      };
    })
    .filter(Boolean) as CategoryNode[];
};

export default buildCategoryTree;
