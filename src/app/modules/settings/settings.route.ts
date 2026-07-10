import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { SETTINGS_IMAGE_FIELDS, settingsUpload } from "@/app/middlewares/upload/upload.config";
import * as controller from "./settings.controller";
import * as validator from "./settings.validation";

const router = Router();
const adminOnly = [authMiddleware(), requireRole("ADMIN")] as const;

/**
 * Chỉ group trong PUBLIC_SETTING_GROUPS mới cho đọc không cần đăng nhập
 * (logo, favicon, maintenance_mode, SEO...). Các group còn lại (wallet, tax, invoice,
 * notification_admin...) có thể chứa cấu hình nhạy cảm → bắt buộc phải là admin.
 */
const restrictPrivateGroup = (req: Request, res: Response, next: NextFunction) => {
  const group = req.params.group as validator.SettingGroup;
  if (validator.PUBLIC_SETTING_GROUPS.includes(group)) return next();

  return authMiddleware()(req, res, (err?: unknown) => {
    if (err) return next(err as Error);
    return requireRole("ADMIN")(req, res, next);
  });
};

// Public reads

// Chỉ trả về các group public — client site dùng để render logo, favicon, maintenance_mode, SEO...
router.get("/", asyncHandler(controller.getAllHandler));

// Public nếu group nằm trong PUBLIC_SETTING_GROUPS, ngược lại bắt buộc admin
router.get("/:group", validate(validator.groupParamSchema, "params"), restrictPrivateGroup, asyncHandler(controller.getGroupHandler));

// Admin write

// settingsUpload.fields() xử lý cả FormData (kèm file ảnh) lẫn JSON body thuần
router.patch(
  "/:group",
  ...adminOnly,
  validate(validator.groupParamSchema, "params"),
  settingsUpload.fields(SETTINGS_IMAGE_FIELDS as unknown as Array<{ name: string; maxCount: number }>),
  asyncHandler(controller.updateGroupHandler),
);

export default router;
