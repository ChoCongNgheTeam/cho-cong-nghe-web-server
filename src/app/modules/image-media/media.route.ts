import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
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
} from "./media.controller";
import {
  createMediaSchema,
  updateMediaSchema,
  reorderMediaSchema,
  getMediaByTypeSchema,
  getMediaByPositionSchema,
  getMediaByTypeAndPositionSchema,
} from "./media.validation";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";

const router = Router();

// === PUBLIC ROUTES ===

// Lấy tất cả media active (grouped by position) - cho Home orchestrator
// GET /api/media/all
router.get("/all", getAllActiveMediaHandler);

// Lấy media theo type (SLIDER hoặc BANNER)
// GET /api/media/type/:type
router.get("/type/:type", getMediaByTypeHandler);

// Lấy media theo position (HOME_TOP, BELOW_SLIDER, ...)
// GET /api/media/position/:position
router.get("/position/:position", getMediaByPositionHandler);

// Lấy media theo type + position (query params)
// GET /api/media/filter?type=SLIDER&position=HOME_TOP
router.get(
  "/filter",
  // validate(getMediaByTypeAndPositionSchema), // Uncomment nếu muốn validate query
  getMediaByTypeAndPositionHandler,
);

// === ADMIN ROUTES ===

// Lấy tất cả media (admin)
router.get("/admin/all", authMiddleware, requireRole("ADMIN"), getAllMediaHandler);

// Lấy media detail (admin)
router.get("/admin/:id", authMiddleware, requireRole("ADMIN"), getMediaDetailHandler);

// Tạo media
router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createMediaSchema),
  createMediaHandler,
);

// Update media
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateMediaSchema),
  updateMediaHandler,
);

// Delete media
router.delete("/admin/:id", authMiddleware, requireRole("ADMIN"), deleteMediaHandler);

// Reorder media
router.post(
  "/admin/reorder",
  authMiddleware,
  requireRole("ADMIN"),
  validate(reorderMediaSchema),
  reorderMediaHandler,
);

export default router;
