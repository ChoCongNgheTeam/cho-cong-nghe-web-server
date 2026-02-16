import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "src/services/token.service";

const extractAccessToken = (req: Request) => {
  if (req.cookies?.accessToken) return req.cookies.accessToken;

  const authHeader = req.headers.authorization;
  // Check Swagger
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
};

export const authMiddleware = (required = true) => {
  // optional auth: false
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractAccessToken(req);

    if (!token) {
      if (required) return res.status(401).json({ message: "Chưa đăng nhập" });
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);

      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (err) {
      if (required) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
      next();
    }
  };
};
