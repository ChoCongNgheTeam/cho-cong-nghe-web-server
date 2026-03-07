import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { getBlogsWithCommentsHandler, getBlogWithCommentsHandler, getBlogsWithCommentsAdminHandler, getBlogWithCommentsAdminHandler } from "./blog-with-comments.controller";
import { listBlogsSchema } from "../blog/blog.validation";
import { blogBySlugParamsSchema, blogParamsSchema } from "../blog/blog.validation";

const router = Router();

// =====================
// === PUBLIC ROUTES ===
// =====================

/**
 * Get blogs with comments count
 * GET /api/blogs-with-comments
 */
router.get("/", validate(listBlogsSchema, "query"), getBlogsWithCommentsHandler);

/**
 * Get blog with comments
 * GET /api/blogs-with-comments/slug/:slug?commentsPage=1&commentsLimit=20
 */
router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), getBlogWithCommentsHandler);

// =====================
// === ADMIN ROUTES ===
// =====================

/**
 * Get blogs with comments count (admin)
 * GET /api/blogs-with-comments/admin/all
 */
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listBlogsSchema, "query"), getBlogsWithCommentsAdminHandler);

/**
 * Get blog with all comments (admin)
 * GET /api/blogs-with-comments/admin/:id?commentsPage=1&commentsLimit=20
 */
router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(blogParamsSchema, "params"), getBlogWithCommentsAdminHandler);

export default router;
