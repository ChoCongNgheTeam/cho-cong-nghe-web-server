import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import {
  getBlogsPublicHandler,
  getBlogBySlugHandler,
  getBlogsAdminHandler,
  getBlogDetailHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
  bulkUpdateBlogStatusHandler,
} from "./blog.controller";
import {
  listBlogsSchema,
  blogBySlugParamsSchema,
  blogParamsSchema,
  createBlogSchema,
  updateBlogSchema,
} from "./blog.validation";

const router = Router();

// =====================
// === PUBLIC ROUTES ===
// =====================

/**
 * Get published blogs
 * GET /api/blogs
 */
router.get("/", validate(listBlogsSchema, "query"), getBlogsPublicHandler);

/**
 * Get blog by slug
 * GET /api/blogs/slug/:slug
 */
router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), getBlogBySlugHandler);

// =====================
// === ADMIN ROUTES ===
// =====================

/**
 * Get all blogs (admin - includes drafts)
 * GET /api/blogs/admin/all
 */
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listBlogsSchema, "query"),
  getBlogsAdminHandler,
);

/**
 * Get blog by ID (admin)
 * GET /api/blogs/admin/:id
 */
router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(blogParamsSchema, "params"),
  getBlogDetailHandler,
);

/**
 * Create blog
 * POST /api/blogs/admin
 */
router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createBlogSchema, "body"),
  createBlogHandler,
);

/**
 * Update blog
 * PATCH /api/blogs/admin/:id
 */
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(blogParamsSchema, "params"),
  validate(updateBlogSchema, "body"),
  updateBlogHandler,
);

/**
 * Delete blog
 * DELETE /api/blogs/admin/:id
 */
router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(blogParamsSchema, "params"),
  deleteBlogHandler,
);

/**
 * Bulk update blog status
 * PATCH /api/blogs/admin/bulk/status
 */
router.patch(
  "/admin/bulk/status",
  authMiddleware,
  requireRole("ADMIN"),
  bulkUpdateBlogStatusHandler,
);

export default router;
