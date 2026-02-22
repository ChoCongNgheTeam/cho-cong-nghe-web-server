import { date, z } from "zod";

const passwordRule = z
  .string()
  .min(6, "Mật khẩu phải ít nhất 6 ký tự")
  .regex(
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/,
    "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu",
  );

export const createUserSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải từ 3 ký tự")
    .max(30, "Tên đăng nhập tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập không hợp lệ"),

  email: z.email("Email không hợp lệ"),

  dateOfBirth: z.string().datetime().optional(),
  password: passwordRule,

  fullName: z
    .string()
    .trim()
    .min(3, "Họ và tên phải từ 3 ký tự")
    .max(30, "Họ và tên tối đa 30 ký tự"),

  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional().default("CUSTOMER"),
  isActive: z.boolean().optional().default(true),
  avatarImage: z.url().optional().or(z.literal("")),
});

export const updateUserSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(3, "Tên đăng nhập phải từ 3 ký tự")
      .max(30, "Tên đăng nhập tối đa 30 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập không hợp lệ")
      .optional(),

    email: z.email("Email không hợp lệ").optional(),

    dateOfBirth: z.string().datetime().optional(),

    password: passwordRule.optional(),

    fullName: z
      .string()
      .trim()
      .min(3, "Họ và tên phải từ 3 ký tự")
      .max(30, "Họ và tên tối đa 30 ký tự")
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ")
      .optional()
      .or(z.literal("")),

    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional(),
    isActive: z.boolean().optional(),
    avatarImage: z.url().optional().or(z.literal("")),
  })
  .strict();

export const updateProfileSchema = updateUserSchema
  .omit({
    userName: true,
    role: true,
    isActive: true,
    email: true,
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
