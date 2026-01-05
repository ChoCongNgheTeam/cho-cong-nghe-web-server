import { z } from "zod";

const passwordRule = z
  .string()
  .min(6, "Mật khẩu phải ít nhất 6 ký tự")
  .regex(
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/,
    "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu"
  );

export const registerSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải từ 3 ký tự")
    .max(30, "Tên đăng nhập tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập không hợp lệ"),

  email: z.email("Email không hợp lệ"),

  password: passwordRule,

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
    .optional(),
});

export const loginSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập phải từ 3 ký tự")
    .max(30, "Tên đăng nhập tối đa 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập không hợp lệ"),
  password: passwordRule,
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email không hợp lệ"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu hiện tại không hợp lệ"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới không được trùng mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
