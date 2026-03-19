import { z } from "zod";

const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const listSpecificationsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(500).default(100),
  search: z.string().optional(),
  group: z.string().optional(),
  isActive: queryBoolean,
  isFilterable: queryBoolean,
  sortBy: z.enum(["createdAt", "name", "group", "sortOrder"]).default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const specParamsSchema = z.object({
  id: z.string().uuid("ID không hợp lệ"),
});

export const createSpecificationSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, "Key chỉ gồm chữ thường, số, gạch dưới"),
  name: z.string().min(1, "Tên không được để trống"),
  group: z.string().default("Thông số khác"),
  unit: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  isFilterable: z.boolean().default(false),
  filterType: z.enum(["RANGE", "ENUM", "BOOLEAN"]).optional(),
  isRequired: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateSpecificationSchema = createSpecificationSchema.partial().omit({ key: true });

export type ListSpecificationsQuery = z.infer<typeof listSpecificationsSchema>;
export type CreateSpecificationInput = z.infer<typeof createSpecificationSchema>;
export type UpdateSpecificationInput = z.infer<typeof updateSpecificationSchema>;
