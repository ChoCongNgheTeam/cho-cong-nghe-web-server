import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/config/db";
import { jwtConfig } from "@/config/jwt";
import { RegisterInput, LoginInput, ResetPasswordInput } from "./auth.validation";
import { signAccessToken } from "@/services/token.service";

// Giả lập lưu reset token (thực tế nên dùng Redis)
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

export const register = async (input: RegisterInput) => {
  const { email, password, ...rest } = input;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  const existingUsername = await prisma.users.findUnique({ where: { userName: rest.userName } });
  if (existingUsername) {
    throw new Error("Username đã được sử dụng");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.users.create({
    data: {
      email,
      passwordHash,
      role: "CUSTOMER",
      ...rest,
    },
    select: {
      id: true,
      email: true,
      userName: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });
};

export const login = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  if (!user.isActive) {
    throw new Error("Tài khoản của bạn đã bị khóa");
  }

  const token = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    // Không báo lỗi để tránh lộ email tồn tại
    return { message: "Nếu email tồn tại, link reset sẽ được gửi" };
  }

  const resetToken = jwt.sign({ userId: user.id }, jwtConfig.secret, {
    expiresIn: "1h",
  });

  const expiresAt = Date.now() + jwtConfig.resetTokenExpiresIn * 1000;
  resetTokens.set(resetToken, { userId: user.id, expiresAt });

  // TODO: Gửi email thực tế (Nodemailer, Resend, etc.)
  console.log("🔗 Link reset password (dev only):");
  console.log(`http://localhost:3000/auth/reset-password?token=${resetToken}`);

  return { message: "Nếu email tồn tại, link reset đã được gửi" };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const { token, password } = input;

  let decoded: any;
  try {
    decoded = jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  const stored = resetTokens.get(token);
  if (!stored || stored.userId !== decoded.userId || Date.now() > stored.expiresAt) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.users.update({
    where: { id: decoded.userId },
    data: { passwordHash },
  });

  resetTokens.delete(token); // xóa token sau khi dùng

  return { message: "Đặt lại mật khẩu thành công" };
};
