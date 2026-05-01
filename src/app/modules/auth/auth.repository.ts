import { UserRole } from "@prisma/client";
import prisma from "src/config/db";
import { OAuthResolvedUser } from "./oauth/oauth.types";

const selectUserWithoutPassword = {
  id: true,
  email: true,
  userName: true,
  fullName: true,
  role: true,
  createdAt: true,
  phone: true,
  gender: true,
  isActive: true,
  avatarImage: true,
};

export const findByEmailOrUserName = async (email: string, userName?: string) => {
  return prisma.users.findFirst({
    where: { OR: [{ email }, { userName }] },
  });
};

export const findByUserName = async (userName?: string) => {
  return prisma.users.findUnique({ where: { userName } });
};

export const findByEmail = async (email: string) => {
  return prisma.users.findUnique({ where: { email } });
};

export const createUser = async (data: any) => {
  return prisma.users.create({
    data,
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

export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.users.update({
    where: { id: userId },
    data: { passwordHash },
    select: selectUserWithoutPassword,
  });
};

// ─── Email Verification ────────────────────────────────────────────────────────

export const setVerificationToken = async (userId: string, token: string, expiresAt: Date) => {
  return prisma.users.update({
    where: { id: userId },
    data: { verificationToken: token, verificationTokenExpiresAt: expiresAt },
  });
};

export const findByVerificationToken = async (token: string) => {
  return prisma.users.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiresAt: { gt: new Date() },
    },
  });
};

export const markUserVerified = async (userId: string) => {
  return prisma.users.update({
    where: { id: userId },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });
};

// ─── Password Reset ────────────────────────────────────────────────────────────

export const createPasswordResetToken = async (userId: string, token: string, expiresAt: Date) => {
  return prisma.password_reset_tokens.create({ data: { userId, token, expiresAt } });
};

export const findPasswordResetToken = async (token: string) => {
  return prisma.password_reset_tokens.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deletePasswordResetToken = async (token: string) => {
  return prisma.password_reset_tokens.delete({ where: { token } });
};

// ─── Refresh Tokens ────────────────────────────────────────────────────────────

export const deleteRefreshToken = async (token: string) => {
  return prisma.refresh_tokens.updateMany({
    where: { token, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const createRefreshToken = async (data: {
  userId: string;
  token: string;
  expiresAt: Date;
  absoluteExpiresAt: Date;
  ttlType: "short" | "long";
  userAgent?: string;
  ip?: string;
  deviceName?: string;
  browser?: string;
  location?: string;
}) => {
  return prisma.refresh_tokens.create({ data });
};

export const findValidRefreshToken = (token: string) => {
  return prisma.refresh_tokens.findFirst({
    where: { token, revokedAt: null, expiresAt: { gt: new Date() } },
  });
};

export const revokeRefreshTokenById = (id: string) => {
  return prisma.refresh_tokens.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllRefreshTokensByUser = (userId: string) => {
  return prisma.refresh_tokens.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const findValidRefreshTokenWithUser = (token: string) => {
  return prisma.refresh_tokens.findFirst({
    where: { token, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: { select: { id: true, role: true, userName: true, email: true } } },
  });
};

export const touchRefreshTokenLastUsed = (id: string) => {
  return prisma.refresh_tokens.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
};

export const cleanupRevokedExpiredRefreshTokens = async () => {
  const now = new Date();
  const result = await prisma.refresh_tokens.deleteMany({
    where: { expiresAt: { lt: now }, revokedAt: { not: null } },
  });
  console.log("🧹 Deleted expired+revoked tokens:", result.count);
  return result;
};

// ─── New Device Detection ──────────────────────────────────────────────────────

/**
 * Returns true if this browser+deviceName combo has been seen before for this user.
 *
 * Strategy: look at the last 30 days of refresh_tokens (including revoked ones,
 * since revoked = logged out, not unknown). If we find a matching row the device
 * is known and no alert is needed.
 *
 * We match on browser string (e.g. "Chrome 147 / Windows 10") because that's the
 * most stable identifier we have without a device fingerprint from the FE.
 * deviceName alone ("Desktop") is too broad, so we require BOTH to match.
 */
export const isKnownDevice = async (userId: string, browser?: string, deviceName?: string): Promise<boolean> => {
  // If we couldn't parse either field, we can't determine novelty — don't spam alerts
  if (!browser && !deviceName) return true;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days window

  const existing = await prisma.refresh_tokens.findFirst({
    where: {
      userId,
      createdAt: { gt: since },
      // Match the most-specific identifier we have
      ...(browser ? { browser } : {}),
      ...(deviceName ? { deviceName } : {}),
    },
    select: { id: true },
  });

  return existing !== null;
};

// ─── OAuth ─────────────────────────────────────────────────────────────────────

export const findOAuthAccount = (provider: string, providerAccountId: string) => {
  return prisma.oauth_accounts.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
};

export const createOAuthAccount = (data: { userId: string; provider: string; providerAccountId: string; accessToken?: string; refreshToken?: string; expiresAt?: Date }) => {
  return prisma.oauth_accounts.create({ data });
};

export const findUserById = (id: string) => {
  return prisma.users.findUnique({ where: { id } });
};

export const createUserFromOAuth = async (data: {
  email: string;
  fullName: string;
  avatarImage?: string | null;
  userName: string;
  gender?: any;
  dateOfBirth?: Date | null;
}): Promise<OAuthResolvedUser> => {
  return prisma.users.create({
    data: {
      ...data,
      passwordHash: null,
      isActive: true,
      isVerified: true, // OAuth users are pre-verified by provider
      role: UserRole.CUSTOMER,
    },
    select: {
      id: true,
      email: true,
      userName: true,
      fullName: true,
      role: true,
      avatarImage: true,
      createdAt: true,
      isActive: true,
    },
  });
};
