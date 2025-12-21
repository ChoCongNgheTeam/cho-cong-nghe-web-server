import * as productRepository from "./product.repository";

export const getProducts = async ({
  categoryId,
  search,
}: {
  categoryId?: string;
  search?: string;
}) => {
  return productRepository.findMany({ categoryId, search });
};

export const getProductById = async (id: string) => {
  return productRepository.findById(id);
};

export const createProduct = async (data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
}) => {
  return productRepository.create(data);
};

export const updateProduct = async (
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    categoryId: string;
  }>
) => {
  return productRepository.update(id, data);
};

export const deleteProduct = async (id: string) => {
  return productRepository.remove(id);
};
