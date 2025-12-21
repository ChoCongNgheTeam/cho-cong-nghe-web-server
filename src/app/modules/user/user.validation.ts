import { z } from "zod";

export const createUserSchema = z.object({
  userName: z.string().min(3).max(30).optional(),
  email: z.email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional().default("CUSTOMER"),
});

export const updateUserSchema = z.object({
  userName: z.string().min(3).max(30).optional(),
  email: z.email({ message: "Email không hợp lệ" }).optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
  avatarImage: z.url().optional().or(z.literal("")),
});

export const updateProfileSchema = updateUserSchema.omit({ role: true, isActive: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
