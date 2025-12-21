import * as categoryRepository from "./category.repository";

export const getCategories = async () => {
  return categoryRepository.findAllWithChildren();
};

export const getCategoryById = async (id: string) => {
  return categoryRepository.findById(id);
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  parentId?: string;
}) => {
  return categoryRepository.create(data);
};

export const updateCategory = async (
  id: string,
  data: Partial<{ name: string; description?: string; parentId?: string }>
) => {
  return categoryRepository.update(id, data);
};

export const deleteCategory = async (id: string) => {
  return categoryRepository.remove(id);
};
