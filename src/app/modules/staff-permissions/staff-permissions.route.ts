import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as controller from "./staff-permissions.controller";
import * as validator from "./staff-permissions.validation";

const router = Router();

// Tất cả routes trong module này chỉ dành cho ADMIN
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ADMIN

// GET /admin/staff-permissions
router.get("/", ...adminAuth, validate(validator.listStaffPermissionsQuerySchema, "query"), asyncHandler(controller.getAllStaffPermissionsHandler));

// GET /admin/staff-permissions/:userId
router.get("/:userId", ...adminAuth, validate(validator.userIdParamsSchema, "params"), asyncHandler(controller.getStaffPermissionsHandler));

// PATCH /admin/staff-permissions/:userId
router.patch("/:userId", ...adminAuth, validate(validator.userIdParamsSchema, "params"), validate(validator.updatePermissionsSchema, "body"), asyncHandler(controller.updateStaffPermissionsHandler));

// POST /admin/staff-permissions/:userId/reset
router.post(
  "/:userId/reset",
  ...adminAuth,
  validate(validator.userIdParamsSchema, "params"),
  validate(validator.resetPermissionsSchema, "body"),
  asyncHandler(controller.resetStaffPermissionsHandler),
);

export default router;
