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
  bulkDeletePromotionHandler,
} from "./promotion.controller";
import {
  listPromotionsSchema,
  promotionParamsSchema,
  createPromotionSchema,
  updatePromotionSchema,
  productParamsSchema,
  categoryParamsSchema,
  brandParamsSchema,
  bulkDeletePromotionSchema,
  listDeletedPromotionsSchema,
} from "./promotion.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// PUBLIC
router.get("/", validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsPublicHandler));
router.get("/active", asyncHandler(getActivePromotionsHandler));
router.get("/product/:productId", validate(productParamsSchema, "params"), asyncHandler(getPromotionsByProductHandler));
router.get("/category/:categoryId", validate(categoryParamsSchema, "params"), asyncHandler(getPromotionsByCategoryHandler));
router.get("/brand/:brandId", validate(brandParamsSchema, "params"), asyncHandler(getPromotionsByBrandHandler));

// STAFF & ADMIN — MARKETING có canPromotions
router.get("/admin/all", ...staffAdminAuth, requirePermission("canPromotions"), validate(listPromotionsSchema, "query"), asyncHandler(getPromotionsAdminHandler));
router.post("/admin", ...staffAdminAuth, requirePermission("canPromotions"), validate(createPromotionSchema, "body"), asyncHandler(createPromotionHandler));
router.delete("/admin/bulk", ...staffAdminAuth, requirePermission("canPromotions"), validate(bulkDeletePromotionSchema, "body"), asyncHandler(bulkDeletePromotionHandler));
// ADMIN ONLY — trash & restore (đặt TRƯỚC /admin/:id vì Express match route theo thứ tự
// đăng ký — nếu để sau, "/admin/trash" sẽ bị "/admin/:id" bắt nhầm với id="trash")
router.get("/admin/trash", ...adminAuth, validate(listDeletedPromotionsSchema, "query"), asyncHandler(getDeletedPromotionsHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(restorePromotionHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(promotionParamsSchema, "params"), asyncHandler(hardDeletePromotionHandler));

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

export default router;
