import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getGroupHandler, getAllHandler, updateGroupHandler } from "./settings.controller";
import { groupParamSchema } from "./settings.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";
import { SETTINGS_IMAGE_FIELDS, settingsUpload } from "@/app/middlewares/upload/upload.config";

const router = Router();
const adminOnly = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public — client site cần đọc logo, favicon, maintenance_mode, SEO... ──
router.get("/", asyncHandler(getAllHandler));
router.get("/:group", validate(groupParamSchema, "params"), asyncHandler(getGroupHandler));

// Chỉ Admin được ghi
// settingsUpload.fields() xử lý cả FormData (có file) lẫn JSON body thuần
// Khi gửi JSON body (không có file), multer vẫn pass through bình thường
router.patch(
  "/:group",
  ...adminOnly,
  validate(groupParamSchema, "params"),
  settingsUpload.fields(SETTINGS_IMAGE_FIELDS as unknown as Array<{ name: string; maxCount: number }>),
  asyncHandler(updateGroupHandler),
);

export default router;
