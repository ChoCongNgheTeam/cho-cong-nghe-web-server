import { z } from "zod";

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
  provinceId: z.number().int("Province ID phải là số nguyên").positive(),
  districtId: z.number().int("District ID phải là số nguyên").positive(),
  wardId: z.number().int("Ward ID phải là số nguyên").positive().optional(),
  detailAddress: z
    .string()
    .trim()
    .min(1, "Địa chỉ chi tiết không được để trống")
    .max(255, "Địa chỉ chi tiết không quá 255 ký tự"),
  type: z.enum(["HOME", "OFFICE"]).optional(),
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
  provinceId: z.number().int("Province ID phải là số nguyên").positive().optional(),
  districtId: z.number().int("District ID phải là số nguyên").positive().optional(),
  wardId: z
    .number()
    .int("Ward ID phải là số nguyên")
    .positive()
    .optional()
    .nullable(),
  detailAddress: z
    .string()
    .trim()
    .min(1, "Địa chỉ chi tiết không được để trống")
    .max(255, "Địa chỉ chi tiết không quá 255 ký tự")
    .optional(),
  type: z.enum(["HOME", "OFFICE"]).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const addressIdSchema = z.object({
  addressId: z.string().uuid("ID địa chỉ không hợp lệ"),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
