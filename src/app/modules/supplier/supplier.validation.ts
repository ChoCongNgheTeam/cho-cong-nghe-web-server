import { z } from "zod";

const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const supplierParamsSchema = z.object({
  id: z.string().uuid("ID nhà cung cấp không hợp lệ"),
});

export const listSuppliersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  isActive: queryBoolean,
  includeDeleted: queryBoolean.pipe(z.boolean().optional().default(false)),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const createSupplierSchema = z.object({
  code: z.string().trim().min(2, "Mã NCC phải từ 2 ký tự").max(30, "Mã NCC tối đa 30 ký tự").optional(),
  name: z.string().trim().min(2, "Tên nhà cung cấp phải từ 2 ký tự").max(150, "Tên tối đa 150 ký tự"),
  contactName: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  taxCode: z.string().trim().max(30).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export const updateSupplierSchema = z.object({
  code: z.string().trim().min(2).max(30).optional(),
  name: z.string().trim().min(2).max(150).optional(),
  contactName: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  taxCode: z.string().trim().max(30).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type ListSuppliersQuery = z.infer<typeof listSuppliersQuerySchema>;
