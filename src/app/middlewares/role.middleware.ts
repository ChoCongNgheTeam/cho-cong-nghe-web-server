import { Request, Response, NextFunction } from "express";

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa xác thực" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    next();
  };
};
