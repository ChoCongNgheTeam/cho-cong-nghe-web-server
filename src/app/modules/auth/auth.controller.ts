import { Request, Response } from "express";
import { register, login, forgotPassword, resetPassword, changePassword, logout, refreshTokenRotation } from "./auth.service";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const setRefreshTokenCookie = (res: Response, token: string, maxAge: number) => {
  res.cookie("refreshToken", token, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge,
  });
};

export const registerHandler = async (req: Request, res: Response) => {
  const user = await register(req.body);
  res.status(201).json({ data: user, message: "Đăng ký thành công" });
};

export const loginHandler = async (req: Request, res: Response) => {
  const { accessToken, accessTokenTTL, refreshToken, refreshTokenTTL, user } = await login(req.body, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  setRefreshTokenCookie(res, refreshToken, refreshTokenTTL);

  res.json({
    user,
    accessToken, // FE lưu vào memory (biến JS / React state)
    accessTokenTTL,
    message: "Đăng nhập thành công",
  });
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const { accessToken, accessTokenTTL, refreshToken, refreshTokenTTL } = await refreshTokenRotation(token);

  setRefreshTokenCookie(res, refreshToken, refreshTokenTTL);

  return res.json({
    accessToken, // FE cập nhật lại memory
    accessTokenTTL,
    message: "Token refreshed",
  });
};

export const logoutHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await logout(refreshToken);
  }

  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

  return res.json({ message: "Đăng xuất thành công" });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const result = await forgotPassword(req.body.email, req);
  res.json(result);
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const result = await resetPassword(req.body);
  res.json(result);
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await changePassword(req.user!.id, currentPassword, newPassword);
  res.json({ message: "Đổi mật khẩu thành công" });
};
