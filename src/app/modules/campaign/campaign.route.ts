import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { campaignUpload } from "@/app/middlewares/upload/upload.config";
import { parseMultipart } from "@/app/middlewares/parse-multipart-data";
import { asyncHandler } from "@/utils/async-handler";
import {
  getCampaignsPublicHandler,
  getCampaignsAdminHandler,
  getActiveCampaignsHandler,
  getCampaignBySlugHandler,
  getCampaignDetailHandler,
  createCampaignHandler,
  updateCampaignHandler,
  deleteCampaignHandler,
  bulkDeleteCampaignsHandler,
  getDeletedCampaignsHandler,
  restoreCampaignHandler,
  hardDeleteCampaignHandler,
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
  campaignOnlyParamsSchema,
  bulkDeleteCampaignsSchema,
} from "./campaign.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

// Campaign là MARKETING-owned — staff khác không cần xem
// Admin vẫn có full quyền qua requirePermission (ADMIN luôn pass)
const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listCampaignsQuerySchema, "query"), asyncHandler(getCampaignsPublicHandler));
router.get("/active", validate(activeCampaignsQuerySchema, "query"), asyncHandler(getActiveCampaignsHandler));
router.get("/slug/:slug", validate(campaignSlugParamsSchema, "params"), asyncHandler(getCampaignBySlugHandler));

// ── Staff & Admin — MARKETING có canCampaigns ──────────────────────────────────
router.get("/admin/all", ...staffAdminAuth, requirePermission("canCampaigns"), validate(listCampaignsQuerySchema, "query"), asyncHandler(getCampaignsAdminHandler));
router.post("/admin", ...staffAdminAuth, requirePermission("canCampaigns"), validate(createCampaignSchema, "body"), asyncHandler(createCampaignHandler));
router.delete("/admin/bulk", ...staffAdminAuth, requirePermission("canCampaigns"), validate(bulkDeleteCampaignsSchema, "body"), asyncHandler(bulkDeleteCampaignsHandler));

// ── Admin only — trash & restore ───────────────────────────────────────────────
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedCampaignsHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(restoreCampaignHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(hardDeleteCampaignHandler));

// ── Staff & Admin — dynamic /:id ───────────────────────────────────────────────
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canCampaigns"), validate(campaignParamsSchema, "params"), asyncHandler(getCampaignDetailHandler));
router.patch("/admin/:id", ...staffAdminAuth, requirePermission("canCampaigns"), validate(campaignParamsSchema, "params"), validate(updateCampaignSchema, "body"), asyncHandler(updateCampaignHandler));
router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canCampaigns"), validate(campaignParamsSchema, "params"), asyncHandler(deleteCampaignHandler));

// ── Campaign Categories ────────────────────────────────────────────────────────
router.post(
  "/admin/:campaignId/categories",
  ...staffAdminAuth,
  requirePermission("canCampaigns"),
  campaignUpload.array("images", 20),
  parseMultipart({ fields: { categories: "json" } }),
  validate(campaignOnlyParamsSchema, "params"),
  validate(addCampaignCategorySchema, "body"),
  asyncHandler(addCategoriesToCampaignHandler),
);
router.get(
  "/admin/:campaignId/categories/:categoryId",
  ...staffAdminAuth,
  requirePermission("canCampaigns"),
  validate(campaignCategoryParamsSchema, "params"),
  asyncHandler(getCampaignCategoryHandler),
);
router.patch(
  "/admin/:campaignId/categories/:categoryId",
  ...staffAdminAuth,
  requirePermission("canCampaigns"),
  campaignUpload.single("image"),
  parseMultipart({ fields: { position: "number", removeImage: "boolean" } }),
  validate(campaignCategoryParamsSchema, "params"),
  validate(updateCampaignCategorySchema, "body"),
  asyncHandler(updateCampaignCategoryHandler),
);
router.delete(
  "/admin/:campaignId/categories/:categoryId",
  ...staffAdminAuth,
  requirePermission("canCampaigns"),
  validate(campaignCategoryParamsSchema, "params"),
  asyncHandler(removeCategoryFromCampaignHandler),
);

export default router;
