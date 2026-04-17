import * as repo from "./specification.repository";
import { ListSpecificationsQuery, CreateSpecificationInput, UpdateSpecificationInput } from "./specification.validation";
import { NotFoundError, BadRequestError } from "@/errors";
import { BulkUpsertCategorySpecsInput, UpsertCategorySpecInput } from "./specification.validation";

const assertExists = async (id: string) => {
  const spec = await repo.findById(id);
  if (!spec) throw new NotFoundError("Thông số");
  return spec;
};

export const getSpecificationsActive = async () => repo.findAllActive();

export const getSpecificationsAdmin = async (query: ListSpecificationsQuery) => repo.findAll(query);

export const getSpecificationById = async (id: string) => {
  const spec = await repo.findById(id);
  if (!spec) throw new NotFoundError("Thông số");
  return spec;
};

export const createSpecification = async (input: CreateSpecificationInput) => {
  const exists = await repo.checkKeyExists(input.key);
  if (exists) throw new BadRequestError(`Key "${input.key}" đã tồn tại`);
  return repo.create(input);
};

export const updateSpecification = async (id: string, input: UpdateSpecificationInput) => {
  await assertExists(id);
  return repo.update(id, input);
};

export const toggleSpecificationActive = async (id: string) => {
  const spec = await assertExists(id);
  return repo.update(id, { isActive: !spec.isActive });
};

export const getCategorySpecs = async (categoryId: string) => {
  const cat = await repo.checkCategoryExists(categoryId);
  if (!cat) throw new NotFoundError("Danh mục");
  const items = await repo.findCategorySpecs(categoryId);
  return { category: cat, items };
};

export const upsertCategorySpec = async (categoryId: string, input: UpsertCategorySpecInput) => {
  const cat = await repo.checkCategoryExists(categoryId);
  if (!cat) throw new NotFoundError("Danh mục");
  const spec = await repo.findById(input.specificationId);
  if (!spec) throw new NotFoundError("Thông số");
  return repo.upsertCategorySpec(categoryId, input);
};

export const bulkUpsertCategorySpecs = async (categoryId: string, input: BulkUpsertCategorySpecsInput) => {
  const cat = await repo.checkCategoryExists(categoryId);
  if (!cat) throw new NotFoundError("Danh mục");
  return repo.bulkUpsertCategorySpecs(categoryId, input.items);
};

export const removeCategorySpec = async (categoryId: string, specificationId: string) => {
  await repo.removeCategorySpec(categoryId, specificationId);
};
