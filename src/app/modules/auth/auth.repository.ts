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
    where: {
      OR: [{ email }, { userName }],
    },
  });
};

export const findByUserName = async (userName?: string) => {
  return prisma.users.findUnique({
    where: { userName },
  });
};

export const findByEmail = async (email: string) => {
  return prisma.users.findUnique({
    where: { email },
  });
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

export const createPasswordResetToken = async (userId: string, token: string, expiresAt: Date) => {
  return prisma.password_reset_tokens.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

export const findPasswordResetToken = async (token: string) => {
  return prisma.password_reset_tokens.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deletePasswordResetToken = async (token: string) => {
  return prisma.password_reset_tokens.delete({
    where: { token },
  });
};

export const deleteRefreshToken = async (token: string) => {
  return prisma.refresh_tokens.updateMany({
    where: {
      token: token,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const createRefreshToken = async (data: { userId: string; token: string; expiresAt: Date; absoluteExpiresAt: Date; ttlType: "short" | "long"; userAgent?: string; ip?: string }) => {
  return prisma.refresh_tokens.create({ data });
};

export const findValidRefreshToken = (token: string) => {
  return prisma.refresh_tokens.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
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
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const findValidRefreshTokenWithUser = (token: string) => {
  return prisma.refresh_tokens.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });
};

export const cleanupRevokedExpiredRefreshTokens = async () => {
  return prisma.refresh_tokens.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      revokedAt: {
        not: null,
      },
    },
  });
};

// ─── OAuth ────────────────────────────────────────────────────────────────────

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

export const createUserFromOAuth = async (data: { email: string; fullName: string; avatarImage?: string; userName: string }): Promise<OAuthResolvedUser> => {
  return prisma.users.create({
    data: {
      ...data,
      passwordHash: null,
      isActive: true,
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
      isActive: true, // 🔥 thêm cái này để check isActive phía dưới
    },
  });
};
