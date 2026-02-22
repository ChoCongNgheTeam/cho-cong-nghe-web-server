import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { blogUpload } from "@/app/middlewares/upload/blogUpload";
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
import { listBlogsSchema, blogBySlugParamsSchema, blogParamsSchema, createBlogSchema, updateBlogSchema, bulkUpdateStatusSchema } from "./blog.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listBlogsSchema, "query"), asyncHandler(getBlogsPublicHandler));
router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), asyncHandler(getBlogBySlugHandler));

// Admin
router.get("/admin/all", ...adminAuth, validate(listBlogsSchema, "query"), asyncHandler(getBlogsAdminHandler));
router.get("/admin/:id", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(getBlogDetailHandler));

router.post("/admin", ...adminAuth, blogUpload.single("imageUrl"), validate(createBlogSchema, "body"), asyncHandler(createBlogHandler));

router.patch("/admin/bulk/status", ...adminAuth, validate(bulkUpdateStatusSchema, "body"), asyncHandler(bulkUpdateBlogStatusHandler));

router.patch("/admin/:id", ...adminAuth, blogUpload.single("imageUrl"), validate(updateBlogSchema, "body"), validate(blogParamsSchema, "params"), asyncHandler(updateBlogHandler));

router.delete("/admin/:id", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(deleteBlogHandler));

export default router;
