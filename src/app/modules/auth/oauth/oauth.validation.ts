import { z } from "zod";

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID token không được để trống"),
});

export const facebookLoginSchema = z.object({
  accessToken: z.string().min(1, "Facebook access token không được để trống"),
});

export const appleLoginSchema = z.object({
  idToken: z.string().min(1, "Apple ID token không được để trống"),
  fullName: z.string().trim().optional(), // Chỉ có lần đầu đăng nhập
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type FacebookLoginInput = z.infer<typeof facebookLoginSchema>;
export type AppleLoginInput = z.infer<typeof appleLoginSchema>;
