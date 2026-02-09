import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
// import { upload } from "@/app/middlewares/upload.middleware";
import { blogUpload } from "@/app/middlewares/upload/blogUpload";
// import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";
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

// Public
router.get("/", validate(listBlogsSchema, "query"), getBlogsPublicHandler);
router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), getBlogBySlugHandler);

// Admin
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listBlogsSchema, "query"),
  getBlogsAdminHandler,
);

router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(blogParamsSchema, "params"),
  getBlogDetailHandler,
);

router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  blogUpload.single("imageUrl"),
  // parseJsonFields,
  createBlogHandler,
);

router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  blogUpload.single("imageUrl"),
  // parseJsonFields,
  validate(blogParamsSchema, "params"),
  updateBlogHandler,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(blogParamsSchema, "params"),
  deleteBlogHandler,
);

router.patch(
  "/admin/bulk/status",
  authMiddleware,
  requireRole("ADMIN"),
  bulkUpdateBlogStatusHandler,
);

export default router;
