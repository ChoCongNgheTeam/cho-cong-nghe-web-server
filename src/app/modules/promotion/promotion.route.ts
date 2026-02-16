import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import {
  // Public handlers
  getPromotionsPublicHandler,
  getActivePromotionsHandler,
  getPromotionsByProductHandler,
  getPromotionsByCategoryHandler,
  getPromotionsByBrandHandler,

  // Admin handlers
  getPromotionsAdminHandler,
  getPromotionByIdHandler,
  createPromotionHandler,
  updatePromotionHandler,
  deletePromotionHandler,
} from "./promotion.controller";
import { listPromotionsSchema, promotionParamsSchema, createPromotionSchema, updatePromotionSchema } from "./promotion.validation";

const router = Router();

// Public

// List promotions
router.get("/", validate(listPromotionsSchema, "query"), getPromotionsPublicHandler);

// Get active promotions
router.get("/active", getActivePromotionsHandler);

// Get promotions by product
router.get("/product/:productId", getPromotionsByProductHandler);

// Get promotions by category
router.get("/category/:categoryId", getPromotionsByCategoryHandler);

// Get promotions by brand
router.get("/brand/:brandId", getPromotionsByBrandHandler);

// Admin

// Get all promotions (admin)
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listPromotionsSchema, "query"), getPromotionsAdminHandler);

// Get promotion by ID (admin)
router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(promotionParamsSchema, "params"), getPromotionByIdHandler);

// Create promotion
router.post("/admin", authMiddleware(), requireRole("ADMIN"), validate(createPromotionSchema, "body"), createPromotionHandler);

// Update promotion
router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(promotionParamsSchema, "params"), validate(updatePromotionSchema, "body"), updatePromotionHandler);

// Delete promotion
router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(promotionParamsSchema, "params"), deletePromotionHandler);

export default router;
