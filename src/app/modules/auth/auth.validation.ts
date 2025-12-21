import { z } from "zod";

export const registerSchema = z.object({
  userName: z.string().min(3).max(30).optional(),
  email: z.email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Email không hợp lệ" }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6, "Mật khẩu mới phải ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
