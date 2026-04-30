import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getAllStaffPermissionsHandler, getStaffPermissionsHandler, updateStaffPermissionsHandler, resetStaffPermissionsHandler } from "./staff-permissions.controller";
import { userIdParamsSchema, updatePermissionsSchema, resetPermissionsSchema } from "./staff-permissions.validation";

const router = Router();

// Tất cả routes trong module này chỉ dành cho ADMIN
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /admin/staff-permissions
router.get("/", ...adminAuth, asyncHandler(getAllStaffPermissionsHandler));

// GET /admin/staff-permissions/:userId
router.get("/:userId", ...adminAuth, validate(userIdParamsSchema, "params"), asyncHandler(getStaffPermissionsHandler));

// PATCH /admin/staff-permissions/:userId
router.patch("/:userId", ...adminAuth, validate(userIdParamsSchema, "params"), validate(updatePermissionsSchema, "body"), asyncHandler(updateStaffPermissionsHandler));

// POST /admin/staff-permissions/:userId/reset
router.post("/:userId/reset", ...adminAuth, validate(userIdParamsSchema, "params"), validate(resetPermissionsSchema, "body"), asyncHandler(resetStaffPermissionsHandler));

export default router;
