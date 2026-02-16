import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { campaignUpload } from "@/app/middlewares/upload/campaignUpload";
import { parseMultipart } from "@/app/middlewares/parse-multipart-data";
import {
  getCampaignsPublicHandler,
  getCampaignsAdminHandler,
  getActiveCampaignsHandler,
  getCampaignBySlugHandler,
  getCampaignDetailHandler,
  createCampaignHandler,
  updateCampaignHandler,
  deleteCampaignHandler,
  addCategoriesToCampaignHandler,
  updateCampaignCategoryHandler,
  removeCategoryFromCampaignHandler,
  getCampaignCategoryHandler,
} from "./campaign.controller";
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignParamsSchema,
  campaignSlugParamsSchema,
  listCampaignsQuerySchema,
  activeCampaignsQuerySchema,
  addCampaignCategorySchema,
  updateCampaignCategorySchema,
  campaignCategoryParamsSchema,
} from "./campaign.validation";

const router = Router();

// ==================== PUBLIC ROUTES ====================

router.get("/", validate(listCampaignsQuerySchema, "query"), getCampaignsPublicHandler);

router.get("/active", validate(activeCampaignsQuerySchema, "query"), getActiveCampaignsHandler);

router.get("/slug/:slug", validate(campaignSlugParamsSchema, "params"), getCampaignBySlugHandler);

// ==================== ADMIN - CAMPAIGN CRUD ====================

router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listCampaignsQuerySchema, "query"), getCampaignsAdminHandler);

router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(campaignParamsSchema, "params"), getCampaignDetailHandler);

router.post("/admin", authMiddleware(), requireRole("ADMIN"), validate(createCampaignSchema, "body"), createCampaignHandler);

router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(campaignParamsSchema, "params"), validate(updateCampaignSchema, "body"), updateCampaignHandler);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(campaignParamsSchema, "params"), deleteCampaignHandler);

// ==================== ADMIN - CAMPAIGN CATEGORIES ====================

router.post(
  "/admin/:campaignId/categories",
  authMiddleware(),
  requireRole("ADMIN"),
  campaignUpload.array("images", 20),
  parseMultipart({
    fields: {
      categories: "json",
    },
  }),
  validate(campaignParamsSchema, "params"),
  validate(addCampaignCategorySchema, "body"),
  addCategoriesToCampaignHandler,
);

router.get("/admin/:campaignId/categories/:categoryId", authMiddleware(), requireRole("ADMIN"), validate(campaignCategoryParamsSchema, "params"), getCampaignCategoryHandler);

router.patch(
  "/admin/:campaignId/categories/:categoryId",
  authMiddleware(),
  requireRole("ADMIN"),
  campaignUpload.single("image"),
  parseMultipart({
    fields: {
      position: "number",
      removeImage: "boolean",
    },
  }),
  validate(campaignCategoryParamsSchema, "params"),
  validate(updateCampaignCategorySchema, "body"),
  updateCampaignCategoryHandler,
);

router.delete("/admin/:campaignId/categories/:categoryId", authMiddleware(), requireRole("ADMIN"), validate(campaignCategoryParamsSchema, "params"), removeCategoryFromCampaignHandler);

export default router;
