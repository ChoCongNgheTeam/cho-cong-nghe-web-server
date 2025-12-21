import { Request, Response } from "express";
import { register, login, forgotPassword, resetPassword } from "./auth.service";

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
    const result = await forgotPassword(req.body.email);
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
