import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/integrations/token.service";
import { getPermissionsForAuth } from "@/app/modules/staff-permissions/staff-permissions.service";
import { PermissionKey, STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const extractAccessToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
};

export const authMiddleware = (required = true) => {
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
        userName: decoded.userName,
      };

      next();
    } catch (err: any) {
      if (!required) return next();

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ code: "TOKEN_EXPIRED" });
      }

      return res.status(401).json({ code: "TOKEN_INVALID" });
    }
  };
};

/**
 * requirePermission
 *
 * Middleware bảo vệ route theo permission cụ thể.
 * - ADMIN: luôn pass
 * - Staff role: kiểm tra bảng staff_permissions
 * - Khác: 403
 *
 * Dùng sau authMiddleware():
 *   router.patch("/admin/:id/approve", authMiddleware(), requirePermission("canReviews"), ...)
 */
export const requirePermission = (permission: PermissionKey) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    // ADMIN luôn có full quyền
    if (req.user.role === "ADMIN") return next();

    // Không phải staff role → không có permissions
    if (!STAFF_ROLES.includes(req.user.role as any)) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const perms = await getPermissionsForAuth(req.user.id);

    if (!perms || !perms[permission]) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này",
        required: permission,
      });
    }

    next();
  };
};
