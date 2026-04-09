import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { mediaUpload } from "@/app/middlewares/upload/mediaUpload";
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

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — tĩnh trước
router.get("/all", asyncHandler(getAllActiveMediaHandler));
router.get("/filter", validate(mediaFilterSchema, "query"), asyncHandler(getMediaByTypeAndPositionHandler));
router.get("/by-category", validate(mediaByCategoryQuerySchema, "query"), asyncHandler(getMediaByCategoryHandler));
router.get("/type/:type", validate(mediaTypeParamsSchema, "params"), asyncHandler(getMediaByTypeHandler));
router.get("/position/:position", validate(mediaPositionParamsSchema, "params"), asyncHandler(getMediaByPositionHandler));

// Admin — tĩnh trước
router.get("/admin/all", ...adminAuth, asyncHandler(getAllMediaHandler));
router.post("/admin/reorder", ...adminAuth, validate(reorderMediaSchema, "body"), asyncHandler(reorderMediaHandler));
router.post("/admin", ...adminAuth, mediaUpload.single("imageUrl"), validate(createMediaSchema, "body"), asyncHandler(createMediaHandler));

// Admin — động sau
router.get("/admin/:id", ...adminAuth, validate(mediaParamsSchema, "params"), asyncHandler(getMediaDetailHandler));
router.patch("/admin/:id", ...adminAuth, mediaUpload.single("imageUrl"), validate(mediaParamsSchema, "params"), validate(updateMediaSchema, "body"), asyncHandler(updateMediaHandler));
router.delete("/admin/:id", ...adminAuth, validate(mediaParamsSchema, "params"), asyncHandler(deleteMediaHandler));

export default router;
