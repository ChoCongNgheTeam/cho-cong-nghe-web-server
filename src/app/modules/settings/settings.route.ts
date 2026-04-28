import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getGroupHandler, getAllHandler, updateGroupHandler } from "./settings.controller";
import { groupParamSchema, updateSettingsSchema } from "./settings.validation";

const router = Router();
const adminOnly = [authMiddleware(), requireRole("ADMIN")] as const;
const staffAdmin = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;

// Staff & Admin có thể đọc settings (cần để hiển thị config)
router.get("/", ...staffAdmin, asyncHandler(getAllHandler));
router.get("/:group", ...staffAdmin, validate(groupParamSchema, "params"), asyncHandler(getGroupHandler));

// Chỉ Admin được ghi
router.patch("/:group", ...adminOnly, validate(groupParamSchema, "params"), validate(updateSettingsSchema, "body"), asyncHandler(updateGroupHandler));

export default router;
