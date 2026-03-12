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
import { listBlogsSchema, blogBySlugParamsSchema, blogParamsSchema, createBlogSchema, updateBlogSchema, bulkUpdateStatusSchema, bulkDeleteSchema, bulkRestoreSchema } from "./blog.validation";

const router = Router();

//  Middleware shortcuts

const staffAdminAuth = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

//  Public

router.get("/", validate(listBlogsSchema, "query"), asyncHandler(getBlogsPublicHandler));

router.get("/slug/:slug", validate(blogBySlugParamsSchema, "params"), asyncHandler(getBlogBySlugHandler));

//  Staff & Admin: list, detail, create, update, soft delete

router.get("/admin/all", ...staffAdminAuth, validate(listBlogsSchema, "query"), asyncHandler(getBlogsAdminHandler));

router.post("/admin", ...staffAdminAuth, blogUpload.single("imageUrl"), validate(createBlogSchema, "body"), asyncHandler(createBlogHandler));

router.patch("/admin/bulk/status", ...staffAdminAuth, validate(bulkUpdateStatusSchema, "body"), asyncHandler(bulkUpdateBlogStatusHandler));

router.delete("/admin/bulk", ...staffAdminAuth, validate(bulkDeleteSchema, "body"), asyncHandler(bulkDeleteBlogsHandler));

router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedBlogsHandler));

router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreSchema, "body"), asyncHandler(bulkRestoreBlogsHandler));

router.post("/admin/:id/restore", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(restoreBlogHandler));

router.delete("/admin/:id/permanent", ...adminAuth, validate(blogParamsSchema, "params"), asyncHandler(hardDeleteBlogHandler));

router.delete("/admin/:id", ...staffAdminAuth, validate(blogParamsSchema, "params"), asyncHandler(deleteBlogHandler));

router.get("/admin/:id", ...staffAdminAuth, validate(blogParamsSchema, "params"), asyncHandler(getBlogDetailHandler));

router.patch("/admin/:id", ...staffAdminAuth, blogUpload.single("imageUrl"), validate(updateBlogSchema, "body"), validate(blogParamsSchema, "params"), asyncHandler(updateBlogHandler));

export default router;
