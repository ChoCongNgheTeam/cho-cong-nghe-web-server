import { Request, Response } from "express";
import { loginWithGoogle, loginWithFacebook, loginWithApple } from "./oauth.service";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

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
