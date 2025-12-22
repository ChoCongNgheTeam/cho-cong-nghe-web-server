import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtConfig } from "src/config/jwt";
import { RegisterInput, LoginInput, ResetPasswordInput } from "./auth.validation";
import { signAccessToken } from "src/services/token.service";
import {
  findByEmailOrUserName,
  findByUserName,
  findByEmail,
  createUser,
  updatePassword,
  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,
} from "./auth.repository";
import { sendResetPasswordEmail } from "@/services/email.service";
import { forgotPasswordRateLimit } from "@/utils/rateLimiter";
import { Request } from "express";
import prisma from "prisma/client";

export const register = async (input: RegisterInput) => {
  const { email, password, ...rest } = input;

  const existedUser = await findByEmailOrUserName(email, rest.userName);

  if (existedUser) {
    if (existedUser.email === email) {
      throw new Error("Email đã được sử dụng");
    }
    throw new Error("Username đã được sử dụng");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return createUser({
    email,
    passwordHash,
    role: "CUSTOMER",
    ...rest,
  });
};

export const login = async (input: LoginInput) => {
  const { userName, password } = input;

  const user = await findByUserName(userName);

  if (!user || !user.isActive) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng");
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

export const forgotPassword = async (email: string, req: Request) => {
  // Rate limit bắt buộc
  forgotPasswordRateLimit(req);

  const user = await findByEmail(email);
  if (!user) {
    return { message: "Nếu email tồn tại, link reset đã được gửi" };
  }

  const resetToken = jwt.sign({ userId: user.id }, jwtConfig.secret, {
    expiresIn: "1h",
  });

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Lưu vào DB (one-time token)
  await createPasswordResetToken(user.id, resetToken, expiresAt);

  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  await sendResetPasswordEmail(user.email, resetLink);

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

  // Tìm token trong DB
  const resetRecord = await findPasswordResetToken(token);

  if (!resetRecord || resetRecord.userId !== decoded.userId || new Date() > resetRecord.expiresAt) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await updatePassword(decoded.userId, passwordHash);

  // Xóa token ngay sau khi dùng (one-time)
  await deletePasswordResetToken(token);

  return { message: "Đặt lại mật khẩu thành công" };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Lấy user kèm passwordHash
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Không thể đổi mật khẩu cho tài khoản này");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await updatePassword(userId, newHash);
};
