import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import {
  getPromotionsPublicHandler,
  getActivePromotionsHandler,
  getPromotionsByProductHandler,
  getPromotionsByCategoryHandler,
  getPromotionsByBrandHandler,
  getPromotionsAdminHandler,
  getPromotionByIdHandler,
  createPromotionHandler,
  updatePromotionHandler,
  deletePromotionHandler,
} from "./promotion.controller";
import { listPromotionsSchema, promotionParamsSchema, createPromotionSchema, updatePromotionSchema } from "./promotion.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsPublicHandler));
router.get("/active", asyncHandler(getActivePromotionsHandler));
router.get("/product/:productId", asyncHandler(getPromotionsByProductHandler));
router.get("/category/:categoryId", asyncHandler(getPromotionsByCategoryHandler));
router.get("/brand/:brandId", asyncHandler(getPromotionsByBrandHandler));

// Admin
router.get("/admin/all", ...adminAuth, validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsAdminHandler));
router.post("/admin", ...adminAuth, validate(createPromotionSchema, "body"), asyncHandler(createPromotionHandler));

// động sau
router.get("/admin/:id", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(getPromotionByIdHandler));
router.patch("/admin/:id", ...adminAuth, validate(promotionParamsSchema, "params"), validate(updatePromotionSchema, "body"), asyncHandler(updatePromotionHandler));
router.delete("/admin/:id", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(deletePromotionHandler));

export default router;
