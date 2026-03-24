import { OAuth2Client } from "google-auth-library";
import { UnauthorizedError, BadRequestError } from "@/errors";
import { signAccessToken, signRefreshToken } from "@/services/token.service";
import { jwtConfig } from "src/config/jwt";
import { createRefreshToken } from "../auth.repository";
import { findOAuthAccount, createOAuthAccount, findByEmail, createUserFromOAuth } from "../auth.repository";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuthResolvedUser } from "./oauth.types";
import { sendWelcomeVoucherNotification } from "@/app/modules/notification/notification.service";
import prisma from "prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OAuthUserProfile {
  providerAccountId: string;
  email: string;
  fullName: string;
  avatarImage?: string | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  gender?: string;
  birthday?: string;
}

interface OAuthLoginMeta {
  userAgent?: string;
  ip?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sinh userName duy nhất từ email (không dùng ký tự đặc biệt) */
const generateUserName = (email: string): string => {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 20);
  const suffix = crypto.randomBytes(3).toString("hex"); // 6 chars
  return `${base}_${suffix}`;
};

/**
 * Tìm hoặc tạo user từ profile OAuth rồi trả về tokens.
 * Logic chung dùng cho mọi provider.
 */
export const findOrCreateOAuthUser = async (provider: string, profile: OAuthUserProfile, meta?: OAuthLoginMeta) => {
  // Đã có tài khoản OAuth này chưa?
  let oauthAccount = await findOAuthAccount(provider, profile.providerAccountId);

  let user: OAuthResolvedUser | null = oauthAccount?.user ?? null;
  if (!user) {
    // Email đã tồn tại? → link account
    const existingUser = profile.email ? await findByEmail(profile.email) : null;

    if (existingUser) {
      user = existingUser;
    } else {
      // 1. Map dữ liệu giới tính của Facebook
      let mappedGender: any = null;
      if (profile.gender) {
        const fbGender = profile.gender.toLowerCase();
        if (fbGender === "male") mappedGender = "MALE";
        else if (fbGender === "female") mappedGender = "FEMALE";
        else mappedGender = "OTHER";
      }

      // 2. Xử lý ngày sinh chuẩn hóa
      let parsedDateOfBirth: Date | null = null;
      if (profile.birthday) {
        const parts = profile.birthday.split("/"); // FB Format: MM/DD/YYYY hoặc YYYY
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10);
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          parsedDateOfBirth = new Date(Date.UTC(year, month - 1, day));
        } else if (parts.length === 1 && parts[0].length === 4) {
          const year = parseInt(parts[0], 10);
          parsedDateOfBirth = new Date(Date.UTC(year, 0, 1));
        }
      }
      // Tạo user mới
      user = await createUserFromOAuth({
        email: profile.email,
        fullName: profile.fullName,
        avatarImage: profile.avatarImage ?? null,
        userName: generateUserName(profile.email),
        gender: mappedGender,
        dateOfBirth: parsedDateOfBirth,
      });

      setImmediate(async () => {
        try {
          if (!user) return; // ← guard để TS không complain
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
          console.error("[OAuth] Failed to create welcome voucher:", err);
        }
      });
    }

    // Tạo bản ghi oauth_accounts
    await createOAuthAccount({
      userId: user.id,
      provider,
      providerAccountId: profile.providerAccountId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      expiresAt: profile.expiresAt,
    });
  }

  if (!user) {
    throw new Error("OAuth user creation failed");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Tài khoản đã bị vô hiệu hóa");
  }

  // Phát token (mặc định short session, không có rememberMe cho OAuth)
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const accessTokenTTL = jwtConfig.accessToken.ttl;
  const refreshTokenTTL = jwtConfig.refreshToken.ttl.short;

  const newRefreshToken = signRefreshToken({ userId: user.id }, refreshTokenTTL);

  await createRefreshToken({
    userId: user.id,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + refreshTokenTTL),
    absoluteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ttlType: "short",
    userAgent: meta?.userAgent,
    ip: meta?.ip,
  });

  return {
    accessToken,
    accessTokenTTL,
    refreshToken: newRefreshToken,
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

// Google

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (idToken: string, meta?: OAuthLoginMeta) => {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new UnauthorizedError("Google token không hợp lệ");
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError("Không lấy được thông tin từ Google");
  }

  const profile: OAuthUserProfile = {
    providerAccountId: payload.sub,
    email: payload.email,
    fullName: payload.name ?? payload.email,
    avatarImage: payload.picture,
  };

  return findOrCreateOAuthUser("google", profile, meta);
};

// ─── Facebook ─────────────────────────────────────────────────────────────────

export const loginWithFacebook = async (accessToken: string, meta?: OAuthLoginMeta) => {
  const fields = "id,name,email,picture.type(large)";
  const url = `https://graph.facebook.com/me?fields=${fields}&access_token=${accessToken}`;

  const response = await fetch(url);
  const data = (await response.json()) as any;

  if (!response.ok || data.error) {
    // IN LỖI RA MÀN HÌNH TERMINAL (NODE.JS)
    console.log("==== LỖI TỪ FACEBOOK ====", data.error);
    throw new UnauthorizedError("Facebook token không hợp lệ");
  }

  if (!data.id) {
    throw new UnauthorizedError("Không lấy được thông tin từ Facebook");
  }

  const profile: OAuthUserProfile = {
    providerAccountId: data.id,
    email: data.email ?? `fb_${data.id}@noemail.local`,
    fullName: data.name ?? "Facebook User",
    avatarImage: data.picture?.data?.url,
    accessToken,
    // Xóa gender và birthday
  };

  return findOrCreateOAuthUser("facebook", profile, meta);
};

export const exchangeFacebookCode = async (code: string, redirectUri: string, meta?: OAuthLoginMeta) => {
  const params = new URLSearchParams({
    client_id: process.env.FB_APP_ID!,
    client_secret: process.env.FB_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch(
    `https://graph.facebook.com/v25.0/oauth/access_token?${params}`
  );
  const tokenData = (await tokenRes.json()) as any;

  if (!tokenRes.ok || tokenData.error) {
    console.log("==== LỖI EXCHANGE FACEBOOK CODE ====");
    console.log("redirect_uri gửi lên:", redirectUri);
    console.log("Facebook error:", JSON.stringify(tokenData.error, null, 2));
    throw new UnauthorizedError("Không thể exchange Facebook code");
  }

  return loginWithFacebook(tokenData.access_token, meta);
};

// ─── Apple ────────────────────────────────────────────────────────────────────

export const loginWithApple = async (input: { idToken: string; fullName?: string }, meta?: OAuthLoginMeta) => {
  const keysRes = await fetch("https://appleid.apple.com/auth/keys");
  if (!keysRes.ok) throw new BadRequestError("Không thể xác thực với Apple");

  const { keys } = (await keysRes.json()) as { keys: any[] };

  const [headerB64] = input.idToken.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());

  const appleKey = keys.find((k: any) => k.kid === header.kid);
  if (!appleKey) throw new UnauthorizedError("Apple public key không khớp");

  const { createPublicKey } = await import("crypto");
  const publicKey = createPublicKey({ key: appleKey, format: "jwk" });
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();

  let payload: any;
  try {
    payload = jwt.verify(input.idToken, pem, {
      algorithms: ["RS256"],
      audience: process.env.APPLE_CLIENT_ID,
      issuer: "https://appleid.apple.com",
    });
  } catch {
    throw new UnauthorizedError("Apple token không hợp lệ hoặc đã hết hạn");
  }

  if (!payload?.sub) throw new UnauthorizedError("Không lấy được thông tin từ Apple");

  const profile: OAuthUserProfile = {
    providerAccountId: payload.sub,
    email: payload.email ?? `apple_${payload.sub}@noemail.local`,
    fullName: input.fullName ?? "Apple User",
  };

  return findOrCreateOAuthUser("apple", profile, meta);
};