import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { blogUpload } from "@/app/middlewares/upload/upload.config";
import { asyncHandler } from "@/utils/async-handler";
import {
  getBlogsPublicHandler,
  getBlogBySlugHandler,
  getBlogsAdminHandler,
  getBlogDetailHandler,
  getBlogAuthorsHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
  bulkDeleteBlogsHandler,
  restoreBlogHandler,
  bulkRestoreBlogsHandler,
  hardDeleteBlogHandler,
  getDeletedBlogsHandler,
  bulkUpdateBlogStatusHandler,
} from "./blog.controller";
import { listBlogsSchema, blogBySlugParamsSchema, blogParamsSchema, createBlogSchema, bulkUpdateStatusSchema, bulkDeleteSchema, bulkRestoreSchema } from "./blog.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listBlogsSchema, "query"), asyncHandler(getBlogsPublicHandler));
router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), asyncHandler(getBlogBySlugHandler));

// ── Staff & Admin — MARKETING có canBlogs ─────────────────────────────────────
router.get("/admin/authors", ...staffAdminAuth, requirePermission("canBlogs"), asyncHandler(getBlogAuthorsHandler));
router.get("/admin/all", ...staffAdminAuth, requirePermission("canBlogs"), validate(listBlogsSchema, "query"), asyncHandler(getBlogsAdminHandler));
router.post("/admin", ...staffAdminAuth, requirePermission("canBlogs"), blogUpload.single("imageUrl"), asyncHandler(createBlogHandler));
router.patch("/admin/bulk/status", ...staffAdminAuth, requirePermission("canBlogs"), validate(bulkUpdateStatusSchema, "body"), asyncHandler(bulkUpdateBlogStatusHandler));
router.delete("/admin/bulk", ...staffAdminAuth, requirePermission("canBlogs"), validate(bulkDeleteSchema, "body"), asyncHandler(bulkDeleteBlogsHandler));

// ── Admin only — trash & restore ───────────────────────────────────────────────
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedBlogsHandler));
router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreSchema, "body"), asyncHandler(bulkRestoreBlogsHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(restoreBlogHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(hardDeleteBlogHandler));

// ── Staff & Admin — dynamic /:id ───────────────────────────────────────────────
router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canBlogs"), validate(blogParamsSchema, "params"), asyncHandler(deleteBlogHandler));
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canBlogs"), validate(blogParamsSchema, "params"), asyncHandler(getBlogDetailHandler));
router.patch("/admin/:id", ...staffAdminAuth, requirePermission("canBlogs"), blogUpload.single("imageUrl"), validate(blogParamsSchema, "params"), asyncHandler(updateBlogHandler));

export default router;
