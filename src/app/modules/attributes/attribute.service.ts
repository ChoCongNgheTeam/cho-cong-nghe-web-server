import * as repo from "./attribute.repository";
import { ListAttributesQuery, CreateAttributeInput, UpdateAttributeInput, CreateOptionInput, UpdateOptionInput } from "./attribute.validation";
import { NotFoundError, BadRequestError } from "@/errors";

const assertExists = async (id: string) => {
  const attr = await repo.findById(id);
  if (!attr) throw new NotFoundError("Thuộc tính");
  return attr;
};

// Public — cho ProductForm
export const getAttributesActive = async () => repo.findAllActive();

// Admin list
export const getAttributesAdmin = async (query: ListAttributesQuery) => repo.findAll(query);

export const getAttributeById = async (id: string) => {
  const attr = await repo.findById(id);
  if (!attr) throw new NotFoundError("Thuộc tính");
  return attr;
};

export const createAttribute = async (input: CreateAttributeInput) => {
  const exists = await repo.checkCodeExists(input.code);
  if (exists) throw new BadRequestError(`Code "${input.code}" đã tồn tại`);
  return repo.create(input);
};

export const updateAttribute = async (id: string, input: UpdateAttributeInput) => {
  await assertExists(id);
  return repo.update(id, input);
};

export const toggleAttributeActive = async (id: string) => {
  const attr = await assertExists(id);
  return repo.update(id, { isActive: !attr.isActive });
};

// Options
export const createOption = async (attributeId: string, input: CreateOptionInput) => {
  await assertExists(attributeId);
  const exists = await repo.checkOptionValueExists(attributeId, input.value);
  if (exists) throw new BadRequestError(`Value "${input.value}" đã tồn tại trong thuộc tính này`);
  return repo.createOption(attributeId, input);
};

export const updateOption = async (attributeId: string, optionId: string, input: UpdateOptionInput) => {
  // Nếu có thay đổi value → kiểm tra duplicate trong cùng attribute
  if (input.value) {
    const exists = await repo.checkOptionValueExists(attributeId, input.value, optionId);
    if (exists) throw new BadRequestError(`Value "${input.value}" đã tồn tại trong thuộc tính này`);
  }
  return repo.updateOption(optionId, input);
};
