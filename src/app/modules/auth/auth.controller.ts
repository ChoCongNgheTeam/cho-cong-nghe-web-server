import { Request, Response } from "express";
import { register, login, forgotPassword, resetPassword, changePassword, logout, refreshTokenRotation } from "./auth.service";

export const registerHandler = async (req: Request, res: Response) => {
  const user = await register(req.body);

  res.status(201).json({
    data: user,
    message: "Đăng ký thành công",
  });
};

export const loginHandler = async (req: Request, res: Response) => {
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  try {
    const { accessToken, accessTokenTTL, refreshToken, refreshTokenTTL, user } = await login(req.body, { userAgent, ip });

    // refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshTokenTTL,
    });

    // access token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: accessTokenTTL,
    });

    res.json({
      user,
      message: "Đăng nhập thành công",
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const { accessToken, accessTokenTTL, refreshToken, refreshTokenTTL } = await refreshTokenRotation(token);

    // refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshTokenTTL,
    });

    // access token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: accessTokenTTL,
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};

export const logoutHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logout(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json({ message: "Đăng xuất thành công" });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email, req);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const result = await resetPassword(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    // req.user chắc chắn tồn tại vì đã qua authMiddleware
    const userId = req.user!.id;

    const { currentPassword, newPassword } = req.body;

    await changePassword(userId, currentPassword, newPassword);

    return res.json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error: any) {
    // Xử lý lỗi cụ thể để frontend dễ phân biệt
    if (error.message === "Mật khẩu hiện tại không đúng") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Đã có lỗi xảy ra khi đổi mật khẩu" });
  }
};
