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
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listCampaignsQuerySchema, "query"), asyncHandler(getCampaignsPublicHandler));
router.get("/active", validate(activeCampaignsQuerySchema, "query"), asyncHandler(getActiveCampaignsHandler));
router.get("/slug/:slug", validate(campaignSlugParamsSchema, "params"), asyncHandler(getCampaignBySlugHandler));

// Admin — Campaign CRUD
router.get("/admin/all", ...adminAuth, validate(listCampaignsQuerySchema, "query"), asyncHandler(getCampaignsAdminHandler));
router.post("/admin", ...adminAuth, validate(createCampaignSchema, "body"), asyncHandler(createCampaignHandler));

// động sau
router.get("/admin/:id", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(getCampaignDetailHandler));
router.patch("/admin/:id", ...adminAuth, validate(campaignParamsSchema, "params"), validate(updateCampaignSchema, "body"), asyncHandler(updateCampaignHandler));
router.delete("/admin/:id", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(deleteCampaignHandler));

// Admin — Campaign Categories
router.post(
  "/admin/:campaignId/categories",
  ...adminAuth,
  campaignUpload.array("images", 20),
  parseMultipart({ fields: { categories: "json" } }),
  validate(campaignParamsSchema, "params"),
  validate(addCampaignCategorySchema, "body"),
  asyncHandler(addCategoriesToCampaignHandler),
);

router.get("/admin/:campaignId/categories/:categoryId", ...adminAuth, validate(campaignCategoryParamsSchema, "params"), asyncHandler(getCampaignCategoryHandler));

router.patch(
  "/admin/:campaignId/categories/:categoryId",
  ...adminAuth,
  campaignUpload.single("image"),
  parseMultipart({ fields: { position: "number", removeImage: "boolean" } }),
  validate(campaignCategoryParamsSchema, "params"),
  validate(updateCampaignCategorySchema, "body"),
  asyncHandler(updateCampaignCategoryHandler),
);

router.delete("/admin/:campaignId/categories/:categoryId", ...adminAuth, validate(campaignCategoryParamsSchema, "params"), asyncHandler(removeCategoryFromCampaignHandler));

export default router;
