import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
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

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// =====================
// === PUBLIC ===
// =====================

router.get("/", validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsPublicHandler));
router.get("/active", asyncHandler(getActivePromotionsHandler));
router.get("/product/:productId", asyncHandler(getPromotionsByProductHandler));
router.get("/category/:categoryId", asyncHandler(getPromotionsByCategoryHandler));
router.get("/brand/:brandId", asyncHandler(getPromotionsByBrandHandler));

// =====================
// === ADMIN — static routes (phải đặt trước :id) ===
// =====================

router.get("/admin/all", ...adminAuth, validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsAdminHandler));
router.post("/admin", ...adminAuth, validate(createPromotionSchema, "body"), asyncHandler(createPromotionHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedPromotionsHandler));
router.delete(
  "/admin/bulk",
  ...adminAuth,
  asyncHandler(() => {
    throw new Error("Not implemented");
  }),
);

// =====================
// === ADMIN — param routes ===
// =====================

router.post("/admin/:id/restore", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(restorePromotionHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(hardDeletePromotionHandler));

router.get("/admin/:id", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(getPromotionDetailHandler));
router.patch("/admin/:id", ...adminAuth, validate(promotionParamsSchema, "params"), validate(updatePromotionSchema, "body"), asyncHandler(updatePromotionHandler));
router.delete("/admin/:id", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(deletePromotionHandler));

export default router;
