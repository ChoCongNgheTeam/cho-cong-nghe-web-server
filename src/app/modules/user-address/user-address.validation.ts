import { z } from "zod";
import { AddressType } from "@prisma/client";

export const createAddressSchema = z.object({
  contactName: z.string().trim().min(1, "Tên liên hệ không được để trống").max(100, "Tên liên hệ không quá 100 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  provinceId: z.string().uuid("Province ID không hợp lệ").min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  wardId: z.string().uuid("Ward ID không hợp lệ").min(1, "Vui lòng chọn Phường/Xã"),
  detailAddress: z.string().trim().min(1, "Địa chỉ chi tiết không được để trống").max(500, "Địa chỉ chi tiết không quá 500 ký tự"),
  type: z.nativeEnum(AddressType).optional(),
  isDefault: z.boolean().default(false).optional(),
});

export const updateAddressSchema = z.object({
  contactName: z.string().trim().min(1, "Tên liên hệ không được để trống").max(100, "Tên liên hệ không quá 100 ký tự").optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
    .optional(),
  provinceId: z.string().uuid("Province ID không hợp lệ").optional(),
  wardId: z.string().uuid("Ward ID không hợp lệ").optional(),
  detailAddress: z.string().trim().min(1, "Địa chỉ chi tiết không được để trống").max(500, "Địa chỉ chi tiết không quá 500 ký tự").optional(),
  type: z.nativeEnum(AddressType).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const addressIdSchema = z.object({
  addressId: z.string().uuid("Address ID không hợp lệ"),
});

export const provinceIdSchema = z.object({
  provinceId: z.string().uuid("Province ID không hợp lệ"),
});

export const wardSearchSchema = z.object({
  q: z.string().min(1, "Từ khóa tìm kiếm không được để trống").optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  perPage: z.coerce.number().min(1).max(1000).default(1000).optional(),
});

// ==================== LOCATION VALIDATION ====================

export const createProvinceSchema = z.object({
  code: z.string().trim().min(1, "Mã tỉnh/thành không được để trống"),
  name: z.string().trim().min(1, "Tên tỉnh/thành không được để trống"),
  fullName: z.string().trim().min(1, "Tên đầy đủ không được để trống"),
  type: z.string().trim().min(1, "Loại không được để trống"),
});

export const createWardSchema = z.object({
  code: z.string().trim().min(1, "Mã phường/xã không được để trống"),
  name: z.string().trim().min(1, "Tên phường/xã không được để trống"),
  fullName: z.string().trim().min(1, "Tên đầy đủ không được để trống"),
  type: z.string().trim().min(1, "Loại không được để trống"),
  provinceId: z.string().uuid("Province ID không hợp lệ"),
});

// ==================== ADMIN QUERIES ====================

export const listAddressesQuerySchema = z.object({
  search: z.string().optional(),
  // [FIX] Thêm userId để admin có thể filter địa chỉ theo user cụ thể
  userId: z.string().uuid("User ID không hợp lệ").optional(),
  provinceId: z.string().uuid().optional(),
  wardId: z.string().uuid().optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().min(1).default(1).optional(),
  perPage: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type ListAddressesQuery = z.infer<typeof listAddressesQuerySchema>;
export type CreateProvinceInput = z.infer<typeof createProvinceSchema>;
export type CreateWardInput = z.infer<typeof createWardSchema>;
