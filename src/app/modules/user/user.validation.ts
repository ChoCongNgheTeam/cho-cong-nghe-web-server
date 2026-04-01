import { z } from "zod";

const passwordRule = z
  .string()
  .min(6, "Mật khẩu phải ít nhất 6 ký tự")
  .regex(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu");

const userNameRule = z
  .string()
  .trim()
  .min(3, "Tên đăng nhập phải từ 3 ký tự")
  .max(30, "Tên đăng nhập tối đa 30 ký tự")
  .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ chứa chữ cái, số và dấu _");

const fullNameRule = z.string().trim().min(2, "Họ và tên phải từ 2 ký tự").max(60, "Họ và tên tối đa 60 ký tự");

const phoneRule = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ")
  .optional()
  .or(z.literal(""));

export const createUserSchema = z.object({
  userName: userNameRule,
  email: z.string().email("Email không hợp lệ"),
  password: passwordRule,
  fullName: fullNameRule,
  phone: phoneRule,
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional().default("CUSTOMER"),
  isActive: z.boolean().optional().default(true),
  avatarImage: z.string().url().optional().or(z.literal("")),
  // avatarPath: publicId Cloudinary — controller tự inject sau khi upload, không nhận từ client
  avatarPath: z.string().optional(),
});

export const updateUserSchema = z
  .object({
    userName: userNameRule.optional(),
    email: z.string().email("Email không hợp lệ").optional(),
    password: passwordRule.optional(),
    fullName: fullNameRule.optional(),
    phone: phoneRule,
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional(),
    isActive: z.boolean().optional(),
    avatarImage: z.string().url().optional().or(z.literal("")),
    avatarPath: z.string().optional(),
    removeAvatar: z.boolean().optional(),
  })
  .strict();

// User tự cập nhật — KHÔNG cho phép đổi: email, userName, role, isActive, password
export const updateProfileSchema = z
  .object({
    fullName: fullNameRule.optional(),
    phone: phoneRule,
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    avatarImage: z.string().url().optional().or(z.literal("")),
    avatarPath: z.string().optional(),
    removeAvatar: z.boolean().optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional(),
  isActive: z.coerce.boolean().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "email", "fullName"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
