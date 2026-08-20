import { Request, Response } from "express";
import crypto from "crypto";
import { loginWithGoogle, loginWithFacebook, loginWithApple, exchangeFacebookCode } from "./oauth.service";
import { REFRESH_COOKIE_OPTIONS } from "@/config/cookie";
import { isSafeInternalPath } from "@/utils/safe-redirect";

const setRefreshTokenCookie = (res: Response, token: string, maxAge: number) => {
  res.cookie("refreshToken", token, { ...REFRESH_COOKIE_OPTIONS, maxAge });
};

const buildMeta = (req: Request) => ({
  userAgent: req.headers["user-agent"],
  ip: req.ip,
});

export const googleLoginHandler = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  const result = await loginWithGoogle(idToken, buildMeta(req));
  setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenTTL);
  res.json({ user: result.user, accessToken: result.accessToken, accessTokenTTL: result.accessTokenTTL, message: "Đăng nhập Google thành công" });
};

export const facebookLoginHandler = async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  const result = await loginWithFacebook(accessToken, buildMeta(req));
  setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenTTL);
  res.json({ user: result.user, accessToken: result.accessToken, accessTokenTTL: result.accessTokenTTL, message: "Đăng nhập Facebook thành công" });
};

export const appleLoginHandler = async (req: Request, res: Response) => {
  const { idToken, fullName } = req.body;
  const result = await loginWithApple({ idToken, fullName }, buildMeta(req));
  setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenTTL);
  res.json({ user: result.user, accessToken: result.accessToken, accessTokenTTL: result.accessTokenTTL, message: "Đăng nhập Apple thành công" });
};

export const facebookCallbackHandler = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const cookieNonce = req.cookies?.oauth_fb_state as string | undefined;

  // Luôn xoá cookie nonce ngay (dùng 1 lần), bất kể kết quả verify.
  res.clearCookie("oauth_fb_state", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  const failRedirect = () => res.redirect(`${process.env.FRONTEND_URL}/account`);

  if (!code || typeof code !== "string") {
    return failRedirect();
  }

  // state có dạng "<nonce>.<encodedReturnUrl>" được set ở /oauth/facebook/init.
  // Phải khớp với nonce lưu trong cookie của chính trình duyệt đã khởi tạo
  // flow này — nếu không khớp/thiếu, đây có thể là 1 cuộc tấn công OAuth
  // login CSRF (kẻ tấn công tự tạo state của họ rồi dụ nạn nhân mở link
  // callback để bị đăng nhập vào tài khoản của kẻ tấn công).
  const rawState = typeof state === "string" ? state : "";
  const dotIndex = rawState.indexOf(".");
  const stateNonce = dotIndex === -1 ? "" : rawState.slice(0, dotIndex);
  const encodedReturnUrl = dotIndex === -1 ? "" : rawState.slice(dotIndex + 1);

  const nonceValid =
    !!cookieNonce &&
    !!stateNonce &&
    cookieNonce.length === stateNonce.length &&
    crypto.timingSafeEqual(Buffer.from(cookieNonce), Buffer.from(stateNonce));

  if (!nonceValid) {
    return failRedirect();
  }

  let returnUrl = "/";
  try {
    const decoded = decodeURIComponent(encodedReturnUrl);
    if (isSafeInternalPath(decoded)) returnUrl = decoded;
  } catch {
    // giữ nguyên "/" mặc định nếu decode lỗi
  }

  const redirectUri = `${process.env.API_BASE_URL}/api/v1/auth/oauth/facebook/callback`;
  const result = await exchangeFacebookCode(code, redirectUri, buildMeta(req));

  // Set refreshToken cookie — sameSite lax để browser gửi sau redirect
  setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenTTL);

  // Không truyền accessToken trên URL nữa
  return res.redirect(`${process.env.FRONTEND_URL}/account/callback?returnUrl=${encodeURIComponent(returnUrl)}`);
};
