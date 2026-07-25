import { z } from "zod";

// Helper: parse query string boolean đúng cách (giống brand.validation.ts)
const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const warehouseParamsSchema = z.object({
  id: z.string().uuid("ID kho không hợp lệ"),
});

export const listWarehousesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  isActive: queryBoolean,
  includeDeleted: queryBoolean.pipe(z.boolean().optional().default(false)),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const createWarehouseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Mã kho phải từ 2 ký tự")
    .max(30, "Mã kho tối đa 30 ký tự")
    .optional(),
  name: z.string().trim().min(2, "Tên kho phải từ 2 ký tự").max(150, "Tên kho tối đa 150 ký tự"),
  address: z.string().trim().max(255, "Địa chỉ tối đa 255 ký tự").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Số điện thoại tối đa 20 ký tự").optional().or(z.literal("")),
  managerName: z.string().trim().max(100, "Tên quản lý tối đa 100 ký tự").optional().or(z.literal("")),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional().or(z.literal("")),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateWarehouseSchema = z.object({
  code: z.string().trim().min(2, "Mã kho phải từ 2 ký tự").max(30, "Mã kho tối đa 30 ký tự").optional(),
  name: z.string().trim().min(2, "Tên kho phải từ 2 ký tự").max(150, "Tên kho tối đa 150 ký tự").optional(),
  address: z.string().trim().max(255, "Địa chỉ tối đa 255 ký tự").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Số điện thoại tối đa 20 ký tự").optional().or(z.literal("")),
  managerName: z.string().trim().max(100, "Tên quản lý tối đa 100 ký tự").optional().or(z.literal("")),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type ListWarehousesQuery = z.infer<typeof listWarehousesQuerySchema>;
