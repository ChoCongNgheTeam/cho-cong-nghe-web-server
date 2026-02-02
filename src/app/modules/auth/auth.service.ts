import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtConfig } from "src/config/jwt";
import { RegisterInput, LoginInput, ResetPasswordInput } from "./auth.validation";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/services/token.service";
import {
  findByEmailOrUserName,
  findByUserName,
  findByEmail,
  createUser,
  updatePassword,
  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,
  deleteRefreshToken,
  createRefreshToken,
  findValidRefreshToken,
  revokeAllRefreshTokensByUser,
  revokeRefreshTokenById,
  findValidRefreshTokenWithUser,
  cleanupRevokedExpiredRefreshTokens,
} from "./auth.repository";

import { sendResetPasswordEmail } from "@/services/email.service";

import { forgotPasswordRateLimit } from "@/utils/rateLimiter";

import { Request } from "express";

import prisma from "prisma/client";

export const register = async (input: RegisterInput) => {
  const { email, password, ...rest } = input;

  const existedUser = await findByEmailOrUserName(email, rest.userName);

  if (existedUser) {
    if (existedUser.email === email || existedUser.userName === rest.userName) {
      throw new Error("Email hoặc tên đăng nhập đã được sử dụng");
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return createUser({
    email,
    passwordHash,
    role: "CUSTOMER",
    avatarImage: "./images/avatar.png",
    ...rest,
  });
};

export const login = async (input: LoginInput, meta?: { userAgent?: string; ip?: string }) => {
  const { userName, password, rememberMe } = input;

  const user = await findByUserName(userName);

  if (!user || !user.isActive) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  const accessTokenTTL = jwtConfig.accessToken.ttl;

  const refreshTokenTTL = rememberMe
    ? jwtConfig.refreshToken.ttl.long
    : jwtConfig.refreshToken.ttl.short;

  const refreshToken = signRefreshToken({ userId: user.id }, refreshTokenTTL);

  await createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + refreshTokenTTL),
    userAgent: meta?.userAgent,
    ip: meta?.ip,
  });

  return {
    accessToken,
    accessTokenTTL,
    refreshToken,
    refreshTokenTTL,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

export const logout = async (refreshToken: string) => {
  await deleteRefreshToken(refreshToken);
};

export const forgotPassword = async (email: string, req: Request) => {
  // Rate limit bắt buộc
  forgotPasswordRateLimit(req);

  const user = await findByEmail(email);
  if (!user) {
    return { message: "Nếu email tồn tại, link reset đã được gửi" };
  }

  const resetToken = jwt.sign(
    { userId: user.id },
    jwtConfig.resetToken.secret,
    { expiresIn: jwtConfig.resetToken.expiresIn / 1000 }, // ms → s
  );

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Lưu vào DB (one-time token)
  await createPasswordResetToken(user.id, resetToken, expiresAt);

  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  await sendResetPasswordEmail(user.email, resetLink);

  return { message: "Nếu email tồn tại, link reset đã được gửi" };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const { token, password } = input;

  let decoded: { userId: string };

  try {
    decoded = jwt.verify(token, jwtConfig.resetToken.secret) as { userId: string };
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
  newPassword: string,
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

export const refreshTokenRotation = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken) as { userId: string };

  const tokenInDb = await findValidRefreshTokenWithUser(refreshToken);

  if (!tokenInDb) {
    await revokeAllRefreshTokensByUser(decoded.userId);
    throw new Error("Refresh token không hợp lệ hoặc đã bị thu hồi");
  }

  await revokeRefreshTokenById(tokenInDb.id);

  const accessToken = signAccessToken({
    userId: decoded.userId,
    role: tokenInDb.user.role,
  });

  const accessTokenTTL = jwtConfig.accessToken.ttl;

  const refreshTokenTTL = jwtConfig.refreshToken.ttl.long;
  const newRefreshToken = signRefreshToken({ userId: decoded.userId }, refreshTokenTTL);

  await createRefreshToken({
    userId: decoded.userId,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + refreshTokenTTL),
  });

  return {
    accessToken,
    accessTokenTTL,
    refreshToken: newRefreshToken,
    refreshTokenTTL,
  };
};

export const cleanupRefreshTokens = async () => {
  const result = await cleanupRevokedExpiredRefreshTokens();
  return result.count;
};
