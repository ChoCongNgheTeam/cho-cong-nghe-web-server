import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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
  touchRefreshTokenLastUsed,
  cleanupRevokedExpiredRefreshTokens,
  setVerificationToken,
  findByVerificationToken,
  markUserVerified,
  isKnownDevice,
} from "./auth.repository";
import { sendResetPasswordEmail, sendVerificationEmail, sendNewDeviceLoginAlert } from "@/services/email.service";
import { forgotPasswordRateLimit } from "@/utils/rateLimiter";
import { Request } from "express";
import prisma from "prisma/client";
import { sendWelcomeVoucherNotification } from "@/app/modules/notification/notification.service";
import { buildSessionMeta } from "./session.util";
import { auditLoginHistory } from "@/app/modules/audit/audit.logger";

// ─── Register ─────────────────────────────────────────────────────────────────

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
    isVerified: false,
    ...rest,
  }).catch(handlePrismaError);

  // Email verification
  const verificationToken = crypto.randomBytes(32).toString("hex");
  await setVerificationToken(user.id, verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000));
  const verifyLink = `${process.env.API_BASE_URL}/api/v1/auth/verify-email?token=${verificationToken}`;
  sendVerificationEmail(normalizedEmail, verifyLink).catch((err) => console.error("[Register] Failed to send verification email:", err));

  // Welcome voucher — fire and forget
  setImmediate(async () => {
    try {
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

  return {
    ...user,
    message: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
  };
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = async (token: string) => {
  if (!token) throw new BadRequestError("Token xác thực không hợp lệ");
  const user = await findByVerificationToken(token);
  if (!user) throw new BadRequestError("Link xác thực không hợp lệ hoặc đã hết hạn");
  await markUserVerified(user.id);
  return { message: "Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ." };
};

// ─── Resend Verification ──────────────────────────────────────────────────────

export const resendVerificationEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase();
  const user = await findByEmail(normalizedEmail);
  const genericMessage = {
    message: "Nếu email tồn tại và chưa được xác thực, link xác nhận đã được gửi lại.",
  };
  if (!user || user.isVerified) return genericMessage;

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await setVerificationToken(user.id, verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000));
  const verifyLink = `${process.env.API_BASE_URL}/api/v1/auth/verify-email?token=${verificationToken}`;
  sendVerificationEmail(normalizedEmail, verifyLink).catch((err) => console.error("[ResendVerification] Failed to send email:", err));
  return genericMessage;
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (input: LoginInput, meta?: { userAgent?: string; ip?: string }) => {
  const { userName, password, rememberMe } = input;

  // Parse UA + IP once — reused for token row, login_history, and device alert
  const sessionMeta = buildSessionMeta(meta?.userAgent, meta?.ip);

  const user = await findByUserName(userName);

  // ── Unified fail helper ────────────────────────────────────────────────────
  const failLogin = (failReason: string, message: string): never => {
    auditLoginHistory({
      userId: user?.id,
      email: user?.email ?? undefined,
      isSuccess: false,
      ip: sessionMeta.ip,
      userAgent: sessionMeta.userAgent,
      browser: sessionMeta.browser,
      location: sessionMeta.location,
      failReason,
    });
    throw new UnauthorizedError(message);
  };

  if (!user || !user.isActive) failLogin("USER_NOT_FOUND", "Tài khoản hoặc mật khẩu không đúng");
  if (!user!.passwordHash) failLogin("NO_PASSWORD", "Tài khoản hoặc mật khẩu không đúng");

  const isPasswordValid = await bcrypt.compare(password, user!.passwordHash!);
  if (!isPasswordValid) failLogin("WRONG_PASSWORD", "Tài khoản hoặc mật khẩu không đúng");

  if (!user!.isVerified) {
    failLogin("EMAIL_NOT_VERIFIED", "Tài khoản chưa được xác thực. Vui lòng kiểm tra email và nhấp vào link xác nhận.");
  }

  // ── Happy path ─────────────────────────────────────────────────────────────

  const accessToken = signAccessToken({
    userId: user!.id,
    role: user!.role,
    userName: user!.userName ?? user!.email ?? user!.id,
  });
  const accessTokenTTL = jwtConfig.accessToken.ttl;

  const refreshTokenTTL = rememberMe ? jwtConfig.refreshToken.ttl.long : jwtConfig.refreshToken.ttl.short;
  const absoluteTTL = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const now = Date.now();
  const refreshToken = signRefreshToken({ userId: user!.id }, refreshTokenTTL);

  await createRefreshToken({
    userId: user!.id,
    token: refreshToken,
    expiresAt: new Date(now + refreshTokenTTL),
    absoluteExpiresAt: new Date(now + absoluteTTL),
    ttlType: rememberMe ? "long" : "short",
    userAgent: sessionMeta.userAgent,
    ip: sessionMeta.ip,
    deviceName: sessionMeta.deviceName,
    browser: sessionMeta.browser,
    location: sessionMeta.location,
  });

  // Write login_history (fire-and-forget via setImmediate inside auditLoginHistory)
  auditLoginHistory({
    userId: user!.id,
    email: user!.email,
    isSuccess: true,
    ip: sessionMeta.ip,
    userAgent: sessionMeta.userAgent,
    browser: sessionMeta.browser,
    location: sessionMeta.location,
  });

  // ── New-device security alert ──────────────────────────────────────────────
  //
  // Logic:
  //   1. Look at refresh_tokens for this user created in the last 30 days.
  //   2. If the current browser+deviceName combo has NEVER appeared → new device.
  //   3. Send a warning email so the real user knows someone (or they themselves)
  //      logged in from an unfamiliar device.
  //
  // This runs fully async after the response is sent — it never delays login.
  // "isKnownDevice" checks the DB BEFORE we inserted the new token, so the
  // current token is not counted (we call it at the top of setImmediate while
  // the new row is already committed, but we query rows with createdAt < now
  // effectively meaning "rows that existed before this login").
  //
  // Edge case — first-ever login: isKnownDevice returns false → alert is sent.
  // That's intentional: the user gets a "welcome, first login" style alert which
  // also serves as confirmation that someone registered with their email.
  //
  setImmediate(async () => {
    try {
      const known = await isKnownDevice(user!.id, sessionMeta.browser, sessionMeta.deviceName);

      if (!known) {
        await sendNewDeviceLoginAlert(user!.email, {
          browser: sessionMeta.browser ?? "Unknown browser",
          deviceName: sessionMeta.deviceName ?? "Unknown device",
          location: sessionMeta.location ?? "Unknown location",
          ip: sessionMeta.ip ?? "Unknown IP",
          time: new Date(),
        });
        console.log(`[Security] New-device alert sent to ${user!.email}`);
      }
    } catch (err) {
      // Never let alert failure affect anything
      console.error("[Login] Failed to send new-device alert:", err);
    }
  });

  return {
    accessToken,
    accessTokenTTL,
    refreshToken,
    refreshTokenTTL,
    user: {
      id: user!.id,
      email: user!.email,
      userName: user!.userName,
      fullName: user!.fullName,
      role: user!.role,
    },
  };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (refreshToken: string) => {
  await deleteRefreshToken(refreshToken);
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (email: string, req: Request) => {
  forgotPasswordRateLimit(req);
  const user = await findByEmail(email);
  if (!user) return { message: "Nếu email tồn tại, link reset đã được gửi" };

  const resetToken = jwt.sign({ userId: user.id }, jwtConfig.resetToken.secret, {
    expiresIn: jwtConfig.resetToken.expiresIn,
  });
  await createPasswordResetToken(user.id, resetToken, new Date(Date.now() + 60 * 60 * 1000));

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendResetPasswordEmail(user.email, resetLink);

  return { message: "Nếu email tồn tại, link reset đã được gửi" };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

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

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) throw new BadRequestError("Không thể đổi mật khẩu cho tài khoản này");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new BadRequestError("Mật khẩu hiện tại không đúng");

  await updatePassword(userId, await bcrypt.hash(newPassword, 10));
};

// ─── Refresh Token Rotation ───────────────────────────────────────────────────

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

  // Stamp lastUsedAt then revoke the old token
  await Promise.all([touchRefreshTokenLastUsed(tokenInDb.id), revokeRefreshTokenById(tokenInDb.id)]);

  const accessToken = signAccessToken({
    userId: decoded.userId,
    role: tokenInDb.user.role,
    userName: tokenInDb.user.userName ?? tokenInDb.user.email ?? tokenInDb.user.id,
  });
  const accessTokenTTL = jwtConfig.accessToken.ttl;
  const refreshTokenTTL = tokenInDb.ttlType === "long" ? jwtConfig.refreshToken.ttl.long : jwtConfig.refreshToken.ttl.short;

  const newRefreshToken = signRefreshToken({ userId: decoded.userId }, refreshTokenTTL);

  try {
    await createRefreshToken({
      userId: decoded.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + refreshTokenTTL),
      absoluteExpiresAt: tokenInDb.absoluteExpiresAt,
      ttlType: tokenInDb.ttlType,
      // Carry session identity forward so device/browser/location stay consistent
      userAgent: tokenInDb.userAgent ?? undefined,
      ip: tokenInDb.ip ?? undefined,
      deviceName: tokenInDb.deviceName ?? undefined,
      browser: tokenInDb.browser ?? undefined,
      location: tokenInDb.location ?? undefined,
    });
  } catch (e: any) {
    if (e.code !== "P2002") throw e; // ignore race-condition duplicate
  }

  return { accessToken, accessTokenTTL, refreshToken: newRefreshToken, refreshTokenTTL };
};

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export const cleanupRefreshTokens = async () => {
  const result = await cleanupRevokedExpiredRefreshTokens();
  return result.count;
};
