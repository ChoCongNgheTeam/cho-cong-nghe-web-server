import { z } from "zod";

const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const listAttributesSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(200).default(50),
  search: z.string().optional(),
  isActive: queryBoolean,
  sortBy: z.enum(["createdAt", "name", "code"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const attributeParamsSchema = z.object({
  id: z.string().min(1, "ID không hợp lệ"),
});

export const createAttributeSchema = z.object({
  code: z
    .string()
    .min(1, "Code không được để trống")
    .regex(/^[a-z0-9_-]+$/, "Code chỉ gồm chữ thường, số, gạch dưới/ngang"),
  name: z.string().min(1, "Tên không được để trống"),
  isActive: z.boolean().default(true),
});

export const updateAttributeSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const createOptionSchema = z.object({
  value: z
    .string()
    .min(1, "Value không được để trống")
    .regex(/^[a-z0-9_-]+$/, "Value chỉ gồm chữ thường, số, gạch dưới/ngang"),
  label: z.string().min(1, "Label không được để trống"),
  isActive: z.boolean().default(true),
});

export const updateOptionSchema = z.object({
  label: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type ListAttributesQuery = z.infer<typeof listAttributesSchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;
