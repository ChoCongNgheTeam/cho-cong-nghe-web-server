import { z } from "zod";
import { AddressType } from "@prisma/client";

// ==================== ADDRESS VALIDATION ====================

export const createAddressSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(1, "Tên liên hệ không được để trống")
    .max(100, "Tên liên hệ không quá 100 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  provinceCode: z
    .coerce
    .number()
    .int("Province code phải là số nguyên")
    .positive("Province code không hợp lệ"),
  wardCode: z
    .coerce
    .number()
    .int("Ward code phải là số nguyên")
    .positive("Ward code không hợp lệ"),
  detailAddress: z
    .string()
    .trim()
    .min(1, "Địa chỉ chi tiết không được để trống")
    .max(500, "Địa chỉ chi tiết không quá 500 ký tự"),
  type: z.nativeEnum(AddressType).optional(),
  isDefault: z.boolean().default(false).optional(),
});

export const updateAddressSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(1, "Tên liên hệ không được để trống")
    .max(100, "Tên liên hệ không quá 100 ký tự")
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
    .optional(),
  provinceCode: z
    .coerce
    .number()
    .int("Province code phải là số nguyên")
    .positive("Province code không hợp lệ")
    .optional(),
  wardCode: z
    .coerce
    .number()
    .int("Ward code phải là số nguyên")
    .positive("Ward code không hợp lệ")
    .optional(),
  detailAddress: z
    .string()
    .trim()
    .min(1, "Địa chỉ chi tiết không được để trống")
    .max(500, "Địa chỉ chi tiết không quá 500 ký tự")
    .optional(),
  type: z.nativeEnum(AddressType).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export const addressIdSchema = z.object({
  addressId: z.string().uuid("Address ID không hợp lệ"),
});

// ==================== ADMIN QUERIES ====================

export const listAddressesQuerySchema = z.object({
  search: z.string().optional(),
  userId: z.string().uuid("User ID không hợp lệ").optional(),
  provinceCode: z.coerce.number().int().positive().optional(),
  wardCode: z.coerce.number().int().positive().optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().min(1).default(1).optional(),
  perPage: z.coerce.number().min(1).max(100).default(20).optional(),
});

export type ListAddressesQuery = z.infer<typeof listAddressesQuerySchema>;