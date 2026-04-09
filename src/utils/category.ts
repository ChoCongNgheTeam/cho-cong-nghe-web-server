export const collectCategoryIds = (node: any): string[] => {
  let ids: string[] = [node.id];

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      ids = ids.concat(collectCategoryIds(child));
    }
  }

  return ids;
};
