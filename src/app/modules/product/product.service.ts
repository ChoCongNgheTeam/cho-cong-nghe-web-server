import { slugify } from "transliteration";
import * as repo from "./product.repository";
import { CreateProductInput, UpdateProductInput, ListProductsQuery } from "./product.validation";
// Định nghĩa lại phương thức toJSON cho BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString(); // Chuyển BigInt thành String để tránh lỗi
  // Hoặc dùng: return Number(this); // Nếu chắc chắn số không quá lớn vượt mức Number an toàn
};

export const getProductsPublic = (q: ListProductsQuery) => repo.findAllPublic(q);
export const getProductsAdmin = (q: ListProductsQuery) => repo.findAllAdmin(q);

export const getProductById = async (id: string) => {
  const product = await repo.findById(id);
  if (!product) throw new Error("Không tìm thấy sản phẩm");
  return product;
};

export const getProductBySlug = async (slug: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new Error("Không tìm thấy sản phẩm");
  return product;
};

export const createProduct = async (input: CreateProductInput) => {
  const slug = slugify(input.name).toLowerCase();
  return repo.create({
    ...input,
    slug,
    categories: input.categories?.map((id) => ({ id })) ?? [],
    variants: input.variants ?? [],
    highlights: input.highlights ?? [],
  });
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const slug = input.name ? slugify(input.name).toLowerCase() : undefined;
  return repo.update(id, { ...input, slug });
};

export const deleteProduct = async (id: string) => {
  await getProductById(id);
  return repo.remove(id);
};
