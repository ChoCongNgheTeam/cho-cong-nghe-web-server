export const buildCategoryPath = (category: any): string[] => {
  const path: string[] = [];

  // console.log(category);

  let current = category;
  while (current) {
    if (current.id) path.push(current.id);
    current = current.parent;
  }

  return path; // ["id", "id", "id"]
};
