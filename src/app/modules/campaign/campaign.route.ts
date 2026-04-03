import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { campaignUpload } from "@/app/middlewares/upload/campaignUpload";
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
  campaignOnlyParamsSchema, // ✅ import thêm
  bulkDeleteCampaignsSchema,
} from "./campaign.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ────────────────────────────────────────────────────────────────────

router.get("/", validate(listCampaignsQuerySchema, "query"), asyncHandler(getCampaignsPublicHandler));
router.get("/active", validate(activeCampaignsQuerySchema, "query"), asyncHandler(getActiveCampaignsHandler));
router.get("/slug/:slug", validate(campaignSlugParamsSchema, "params"), asyncHandler(getCampaignBySlugHandler));

// ── Admin — static routes (phải đặt trước /:id) ───────────────────────────────

router.get("/admin/all", ...adminAuth, validate(listCampaignsQuerySchema, "query"), asyncHandler(getCampaignsAdminHandler));
router.post("/admin", ...adminAuth, validate(createCampaignSchema, "body"), asyncHandler(createCampaignHandler));

/** Thùng rác */
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedCampaignsHandler));

/** Bulk soft delete */
router.delete("/admin/bulk", ...adminAuth, validate(bulkDeleteCampaignsSchema, "body"), asyncHandler(bulkDeleteCampaignsHandler));

// ── Admin — dynamic /:id ───────────────────────────────────────────────────────

router.get("/admin/:id", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(getCampaignDetailHandler));
router.patch("/admin/:id", ...adminAuth, validate(campaignParamsSchema, "params"), validate(updateCampaignSchema, "body"), asyncHandler(updateCampaignHandler));

/** Soft delete */
router.delete("/admin/:id", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(deleteCampaignHandler));

/** Khôi phục */
router.post("/admin/:id/restore", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(restoreCampaignHandler));

/** Xoá vĩnh viễn (chỉ sau khi đã soft-delete) */
router.delete("/admin/:id/permanent", ...adminAuth, validate(campaignParamsSchema, "params"), asyncHandler(hardDeleteCampaignHandler));

// ── Admin — Campaign Categories ───────────────────────────────────────────────

router.post(
  "/admin/:campaignId/categories",
  ...adminAuth,
  campaignUpload.array("images", 20),
  parseMultipart({ fields: { categories: "json" } }),
  validate(campaignOnlyParamsSchema, "params"),
  validate(addCampaignCategorySchema, "body"),
  asyncHandler(addCategoriesToCampaignHandler),
);

router.get(
  "/admin/:campaignId/categories/:categoryId",
  ...adminAuth,
  validate(campaignCategoryParamsSchema, "params"),
  asyncHandler(getCampaignCategoryHandler),
);

router.patch(
  "/admin/:campaignId/categories/:categoryId",
  ...adminAuth,
  campaignUpload.single("image"),
  parseMultipart({ fields: { position: "number", removeImage: "boolean" } }),
  validate(campaignCategoryParamsSchema, "params"),
  validate(updateCampaignCategorySchema, "body"),
  asyncHandler(updateCampaignCategoryHandler),
);

router.delete(
  "/admin/:campaignId/categories/:categoryId",
  ...adminAuth,
  validate(campaignCategoryParamsSchema, "params"),
  asyncHandler(removeCategoryFromCampaignHandler),
);

export default router;