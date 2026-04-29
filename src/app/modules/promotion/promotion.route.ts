import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getPromotionsPublicHandler,
  getActivePromotionsHandler,
  getPromotionsByProductHandler,
  getPromotionsByCategoryHandler,
  getPromotionsByBrandHandler,
  getPromotionsAdminHandler,
  getPromotionDetailHandler,
  createPromotionHandler,
  updatePromotionHandler,
  deletePromotionHandler,
  restorePromotionHandler,
  hardDeletePromotionHandler,
  getDeletedPromotionsHandler,
} from "./promotion.controller";
import { listPromotionsSchema, promotionParamsSchema, createPromotionSchema, updatePromotionSchema } from "./promotion.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsPublicHandler));
router.get("/active", asyncHandler(getActivePromotionsHandler));
router.get("/product/:productId", asyncHandler(getPromotionsByProductHandler));
router.get("/category/:categoryId", asyncHandler(getPromotionsByCategoryHandler));
router.get("/brand/:brandId", asyncHandler(getPromotionsByBrandHandler));

// ── Staff & Admin — MARKETING có canPromotions ────────────────────────────────
router.get("/admin/all", ...staffAdminAuth, requirePermission("canPromotions"), validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsAdminHandler));
router.post("/admin", ...staffAdminAuth, requirePermission("canPromotions"), validate(createPromotionSchema, "body"), asyncHandler(createPromotionHandler));
router.delete(
  "/admin/bulk",
  ...staffAdminAuth,
  requirePermission("canPromotions"),
  asyncHandler(() => {
    throw new Error("Not implemented");
  }),
);
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canPromotions"), validate(promotionParamsSchema, "params"), asyncHandler(getPromotionDetailHandler));
router.patch(
  "/admin/:id",
  ...staffAdminAuth,
  requirePermission("canPromotions"),
  validate(promotionParamsSchema, "params"),
  validate(updatePromotionSchema, "body"),
  asyncHandler(updatePromotionHandler),
);
router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canPromotions"), validate(promotionParamsSchema, "params"), asyncHandler(deletePromotionHandler));

// ── Admin only — trash & restore ───────────────────────────────────────────────
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedPromotionsHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(restorePromotionHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(hardDeletePromotionHandler));

export default router;
