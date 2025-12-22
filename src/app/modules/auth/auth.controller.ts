import { Request, Response } from "express";
import { register, login, forgotPassword, resetPassword, changePassword } from "./auth.service";

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const user = await register(req.body);
    res.status(201).json({
      data: user,
      message: "Đăng ký thành công",
    });
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = await login(req.body);
    res.json({
      data: result,
      message: "Đăng nhập thành công",
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
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
