import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtConfig } from "src/config/jwt";
import { DuplicateError, UnauthorizedError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
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
  revokeAllRefreshTokensByUser,
  revokeRefreshTokenById,
  findValidRefreshTokenWithUser,
  cleanupRevokedExpiredRefreshTokens,
} from "./auth.repository";
import { sendResetPasswordEmail } from "@/services/email.service";
import { forgotPasswordRateLimit } from "@/utils/rateLimiter";
import { Request } from "express";
import prisma from "prisma/client";
import { sendWelcomeVoucherNotification } from "@/app/modules/notification/notification.service";

export const register = async (input: RegisterInput) => {
  const { email, password, ...rest } = input;

  const normalizedEmail = email.toLowerCase();

  const existedUser = await findByEmailOrUserName(normalizedEmail, rest.userName);

  if (existedUser) {
    if (existedUser.email === normalizedEmail) throw new DuplicateError("Email");
    if (existedUser.userName === rest.userName) throw new DuplicateError("Tên đăng nhập");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    email: normalizedEmail,
    passwordHash,
    role: "CUSTOMER",
    avatarImage: null,
    ...rest,
  }).catch(handlePrismaError);

  // tạo WELCOME voucher + gửi notification (fire and forget)
  setImmediate(async () => {
    try {
      // Tạo voucher riêng cho user này
      const welcomeVoucher = await prisma.vouchers.create({
        data: {
          code: `WELCOME_${user.id.slice(0, 8).toUpperCase()}`,
          description: "Voucher chào mừng thành viên mới",
          discountType: "DISCOUNT_FIXED",
          discountValue: "100000",
          minOrderValue: "500000",
          maxDiscountValue: "100000",
          maxUses: 1,
          maxUsesPerUser: 1,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          priority: 10,
          targets: { create: [{ targetType: "ALL" }] },
        },
      });

      await prisma.voucher_user.create({
        data: { voucherId: welcomeVoucher.id, userId: user.id, maxUses: 1, usedCount: 0 },
      });

      await sendWelcomeVoucherNotification(user.id, welcomeVoucher.code, 100000);
    } catch (err) {
      console.error("[Register] Failed to create welcome voucher:", err);
    }
  });

  return user;
};

export const login = async (input: LoginInput, meta?: { userAgent?: string; ip?: string }) => {
  const { userName, password, rememberMe } = input;

  const user = await findByUserName(userName);

  if (!user || !user.isActive) {
    throw new UnauthorizedError("Tài khoản hoặc mật khẩu không đúng");
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError("Tài khoản hoặc mật khẩu không đúng");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Tài khoản hoặc mật khẩu không đúng");
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const accessTokenTTL = jwtConfig.accessToken.ttl;

  const refreshTokenTTL = rememberMe ? jwtConfig.refreshToken.ttl.long : jwtConfig.refreshToken.ttl.short;

  const absoluteTTL = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 ngày, 7 ngày

  const now = Date.now();
  const refreshToken = signRefreshToken({ userId: user.id }, refreshTokenTTL);

  await createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(now + refreshTokenTTL),
    absoluteExpiresAt: new Date(now + absoluteTTL),
    ttlType: rememberMe ? "long" : "short",
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
  forgotPasswordRateLimit(req);

  const user = await findByEmail(email);
  if (!user) {
    // Không lộ thông tin email có tồn tại hay không
    return { message: "Nếu email tồn tại, link reset đã được gửi" };
  }

  const resetToken = jwt.sign({ userId: user.id }, jwtConfig.resetToken.secret, {
    expiresIn: jwtConfig.resetToken.expiresIn,
  });

  await createPasswordResetToken(user.id, resetToken, new Date(Date.now() + 60 * 60 * 1000));

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendResetPasswordEmail(user.email, resetLink);

  return { message: "Nếu email tồn tại, link reset đã được gửi" };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const { token, password } = input;

  let decoded: { userId: string };

  try {
    decoded = jwt.verify(token, jwtConfig.resetToken.secret) as { userId: string };
  } catch {
    throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");
  }

  const resetRecord = await findPasswordResetToken(token);

  if (!resetRecord || resetRecord.userId !== decoded.userId || new Date() > resetRecord.expiresAt) {
    throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updatePassword(decoded.userId, passwordHash);
  await deletePasswordResetToken(token);

  return { message: "Đặt lại mật khẩu thành công" };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    throw new BadRequestError("Không thể đổi mật khẩu cho tài khoản này");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new BadRequestError("Mật khẩu hiện tại không đúng");
  }

  await updatePassword(userId, await bcrypt.hash(newPassword, 10));
};

export const refreshTokenRotation = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken) as { userId: string };

  const tokenInDb = await findValidRefreshTokenWithUser(refreshToken);

  if (!tokenInDb) {
    await revokeAllRefreshTokensByUser(decoded.userId);
    throw new UnauthorizedError("Refresh token không hợp lệ hoặc đã bị thu hồi");
  }

  if (Date.now() > tokenInDb.absoluteExpiresAt.getTime()) {
    await revokeAllRefreshTokensByUser(decoded.userId);
    throw new UnauthorizedError("Session đã hết hạn, vui lòng đăng nhập lại");
  }

  await revokeRefreshTokenById(tokenInDb.id);

  const accessToken = signAccessToken({ userId: decoded.userId, role: tokenInDb.user.role });
  const accessTokenTTL = jwtConfig.accessToken.ttl;

  const refreshTokenTTL = tokenInDb.ttlType === "long" ? jwtConfig.refreshToken.ttl.long : jwtConfig.refreshToken.ttl.short;

  const newRefreshToken = signRefreshToken({ userId: decoded.userId }, refreshTokenTTL);

  await createRefreshToken({
    userId: decoded.userId,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + refreshTokenTTL),
    absoluteExpiresAt: tokenInDb.absoluteExpiresAt, // giữ nguyên deadline tuyệt đối
    ttlType: tokenInDb.ttlType,
  });

  return { accessToken, accessTokenTTL, refreshToken: newRefreshToken, refreshTokenTTL };
};

export const cleanupRefreshTokens = async () => {
  const result = await cleanupRevokedExpiredRefreshTokens();
  return result.count;
};
