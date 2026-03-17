import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { blogUpload } from "@/app/middlewares/upload/blogUpload";
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

const router = Router();

//  Middleware shortcuts
const staffAdminAuth = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ────────────────────────────────────────────────────────────────────

router.get("/", validate(listBlogsSchema, "query"), asyncHandler(getBlogsPublicHandler));
router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), asyncHandler(getBlogBySlugHandler));

// ── Staff & Admin — static routes (đặt trước /:id) ───────────────────────────

/** Danh sách tác giả — dùng cho filter dropdown FE */
router.get("/admin/authors", ...staffAdminAuth, asyncHandler(getBlogAuthorsHandler));

/** List admin */
router.get("/admin/all", ...staffAdminAuth, validate(listBlogsSchema, "query"), asyncHandler(getBlogsAdminHandler));

/**
 * Create — multipart/form-data.
 * validate(createBlogSchema) bỏ khỏi route vì body thật nằm trong
 * req.body.data (JSON string) sau parseMultipartData — validate trong handler.
 */
router.post("/admin", ...staffAdminAuth, blogUpload.single("imageUrl"), asyncHandler(createBlogHandler));

/** Bulk: đặt trước /admin/:id để tránh conflict */
router.patch("/admin/bulk/status", ...staffAdminAuth, validate(bulkUpdateStatusSchema, "body"), asyncHandler(bulkUpdateBlogStatusHandler));
router.delete("/admin/bulk", ...staffAdminAuth, validate(bulkDeleteSchema, "body"), asyncHandler(bulkDeleteBlogsHandler));

// ── Admin only — static ───────────────────────────────────────────────────────

/** Thùng rác */
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedBlogsHandler));

/** Bulk restore */
router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreSchema, "body"), asyncHandler(bulkRestoreBlogsHandler));

// ── Staff & Admin + Admin only — dynamic /:id ─────────────────────────────────

/** Restore — Admin only */
router.post("/admin/:id/restore", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(restoreBlogHandler));

/** Hard delete — Admin only */
router.delete("/admin/:id/permanent", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(hardDeleteBlogHandler));

/** Soft delete — Staff & Admin */
router.delete("/admin/:id", ...staffAdminAuth, validate(blogParamsSchema, "params"), asyncHandler(deleteBlogHandler));

/** Detail */
router.get("/admin/:id", ...staffAdminAuth, validate(blogParamsSchema, "params"), asyncHandler(getBlogDetailHandler));

/**
 * Update — multipart/form-data.
 * validate(updateBlogSchema) bỏ khỏi route — validate trong handler sau parseMultipartData.
 */
router.patch("/admin/:id", ...staffAdminAuth, blogUpload.single("imageUrl"), validate(blogParamsSchema, "params"), asyncHandler(updateBlogHandler));

export default router;
