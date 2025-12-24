export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
};

export type CategoryNode = CategoryRow & {
  children: CategoryNode[];
};
