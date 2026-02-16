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
} from "./media.controller";
import { createMediaSchema, updateMediaSchema, reorderMediaSchema, mediaParamsSchema, mediaTypeParamsSchema, mediaPositionParamsSchema, mediaFilterSchema } from "./media.validation";

const router = Router();

// Lần sau Thêm param linh hoạt hơn, hiện tại chưa tốt cho admin

// Public
router.get("/all", getAllActiveMediaHandler);
router.get("/type/:type", validate(mediaTypeParamsSchema, "params"), getMediaByTypeHandler);
router.get("/position/:position", validate(mediaPositionParamsSchema, "params"), getMediaByPositionHandler);
router.get("/filter", validate(mediaFilterSchema, "query"), getMediaByTypeAndPositionHandler);

// Admin
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), getAllMediaHandler);

router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(mediaParamsSchema, "params"), getMediaDetailHandler);

router.post("/admin", authMiddleware(), requireRole("ADMIN"), mediaUpload.single("imageUrl"), validate(createMediaSchema, "body"), createMediaHandler);

router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), mediaUpload.single("imageUrl"), validate(updateMediaSchema, "body"), validate(mediaParamsSchema, "params"), updateMediaHandler);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(mediaParamsSchema, "params"), deleteMediaHandler);

router.post("/admin/reorder", authMiddleware(), requireRole("ADMIN"), validate(reorderMediaSchema, "body"), reorderMediaHandler);

export default router;
