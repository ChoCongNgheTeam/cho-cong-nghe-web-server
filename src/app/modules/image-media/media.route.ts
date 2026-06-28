import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { mediaUpload } from "@/app/middlewares/upload/upload.config";
import {
  getMediaByTypeHandler,
  getMediaByPositionHandler,
  getMediaByTypeAndPositionHandler,
  getAllActiveMediaHandler,
  getAllMediaHandler,
  getMediaDetailHandler,
  createMediaHandler,
  updateMediaHandler,
  deleteMediaHandler,
  reorderMediaHandler,
  getMediaByCategoryHandler,
} from "./media.controller";
import {
  createMediaSchema,
  updateMediaSchema,
  reorderMediaSchema,
  mediaParamsSchema,
  mediaTypeParamsSchema,
  mediaPositionParamsSchema,
  mediaFilterSchema,
  mediaByCategoryQuerySchema,
} from "./media.validation";
import { asyncHandler } from "@/utils/async-handler";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/all", asyncHandler(getAllActiveMediaHandler));
router.get("/filter", validate(mediaFilterSchema, "query"), asyncHandler(getMediaByTypeAndPositionHandler));
router.get("/by-category", validate(mediaByCategoryQuerySchema, "query"), asyncHandler(getMediaByCategoryHandler));
router.get("/type/:type", validate(mediaTypeParamsSchema, "params"), asyncHandler(getMediaByTypeHandler));
router.get("/position/:position", validate(mediaPositionParamsSchema, "params"), asyncHandler(getMediaByPositionHandler));

// ── Staff & Admin — MARKETING có canMedia ─────────────────────────────────────
router.get("/admin/all", ...staffAdminAuth, requirePermission("canMedia"), asyncHandler(getAllMediaHandler));
router.post("/admin/reorder", ...staffAdminAuth, requirePermission("canMedia"), validate(reorderMediaSchema, "body"), asyncHandler(reorderMediaHandler));
router.post("/admin", ...staffAdminAuth, requirePermission("canMedia"), mediaUpload.single("imageUrl"), validate(createMediaSchema, "body"), asyncHandler(createMediaHandler));
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canMedia"), validate(mediaParamsSchema, "params"), asyncHandler(getMediaDetailHandler));
router.patch(
  "/admin/:id",
  ...staffAdminAuth,
  requirePermission("canMedia"),
  mediaUpload.single("imageUrl"),
  validate(mediaParamsSchema, "params"),
  validate(updateMediaSchema, "body"),
  asyncHandler(updateMediaHandler),
);
router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canMedia"), validate(mediaParamsSchema, "params"), asyncHandler(deleteMediaHandler));

export default router;
