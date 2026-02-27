import { OAuth2Client } from "google-auth-library";
import { UnauthorizedError, BadRequestError } from "@/errors";
import { signAccessToken, signRefreshToken } from "@/services/token.service";
import { jwtConfig } from "src/config/jwt";
import { createRefreshToken } from "../auth.repository";
import { findOAuthAccount, createOAuthAccount, findByEmail, createUserFromOAuth } from "../auth.repository";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuthResolvedUser } from "./oauth.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OAuthUserProfile {
  providerAccountId: string;
  email: string;
  fullName: string;
  avatarImage?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
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
  // 1. Đã có tài khoản OAuth này chưa?
  let oauthAccount = await findOAuthAccount(provider, profile.providerAccountId);

  let user: OAuthResolvedUser | null = oauthAccount?.user ?? null;
  if (!user) {
    // 2. Email đã tồn tại? → link account
    const existingUser = profile.email ? await findByEmail(profile.email) : null;

    if (existingUser) {
      user = existingUser;
    } else {
      // 3. Tạo user mới
      user = await createUserFromOAuth({
        email: profile.email,
        fullName: profile.fullName,
        avatarImage: profile.avatarImage ?? "./images/avatar.png",
        userName: generateUserName(profile.email),
      });
    }

    // 4. Tạo bản ghi oauth_accounts
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

  // 5. Phát token (mặc định short session, không có rememberMe cho OAuth)
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

// ─── Google ───────────────────────────────────────────────────────────────────

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
    throw new UnauthorizedError("Facebook token không hợp lệ");
  }

  if (!data.id) {
    throw new UnauthorizedError("Không lấy được thông tin từ Facebook");
  }

  const profile: OAuthUserProfile = {
    providerAccountId: data.id,
    email: data.email ?? `fb_${data.id}@noemail.local`, // Facebook có thể không trả email
    fullName: data.name ?? "Facebook User",
    avatarImage: data.picture?.data?.url,
    accessToken,
  };

  return findOrCreateOAuthUser("facebook", profile, meta);
};

// ─── Apple ────────────────────────────────────────────────────────────────────

/**
 * Verify Apple identity token (JWT signed bởi Apple).
 * Apple trả về id_token dạng JWT, ta verify bằng public key của Apple.
 * Lần đầu đăng nhập Apple mới trả fullName trong body request.
 */
export const loginWithApple = async (input: { idToken: string; fullName?: string }, meta?: OAuthLoginMeta) => {
  // Fetch Apple public keys
  const keysRes = await fetch("https://appleid.apple.com/auth/keys");
  if (!keysRes.ok) throw new BadRequestError("Không thể xác thực với Apple");

  const { keys } = (await keysRes.json()) as { keys: any[] };

  // Decode header để lấy kid
  const [headerB64] = input.idToken.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());

  const appleKey = keys.find((k: any) => k.kid === header.kid);
  if (!appleKey) throw new UnauthorizedError("Apple public key không khớp");

  // Convert JWK → PEM
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
    // Apple chỉ gửi tên lần đầu đăng nhập
    fullName: input.fullName ?? "Apple User",
  };

  return findOrCreateOAuthUser("apple", profile, meta);
};
