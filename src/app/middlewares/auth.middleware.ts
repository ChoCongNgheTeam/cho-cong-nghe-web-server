import { Request, Response, NextFunction } from "express";
import prisma from "src/config/db";
import { verifyAccessToken } from "src/services/token.service";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const decoded = verifyAccessToken(accessToken);

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Tài khoản đã bị khóa" });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Access token không hợp lệ hoặc hết hạn" });
  }
};

export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) return next();

  try {
    const decoded = verifyAccessToken(accessToken);

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return next();

    req.user = {
      id: user.id,
      role: user.role,
    };
  } catch {
    // token sai / hết hạn → coi như chưa login
  }

  next();
};
