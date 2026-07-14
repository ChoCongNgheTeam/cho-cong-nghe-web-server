import { Router } from "express";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  createReviewHandler,
  getProductReviewsHandler,
  getAllReviewsAdminHandler,
  getReviewDetailHandler,
  updateReviewAdminHandler,
  approveReviewHandler,
  bulkApproveReviewsHandler,
  deleteReviewAdminHandler,
  bulkDeleteReviewsHandler,
  restoreReviewHandler,
  bulkRestoreReviewsHandler,
  hardDeleteReviewHandler,
  getDeletedReviewsHandler,
} from "./review.controller";
import { createReviewSchema, updateReviewAdminSchema, listReviewsSchema, reviewParamsSchema, bulkApproveReviewSchema, bulkDeleteReviewSchema, bulkRestoreReviewSchema } from "./review.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// PUBLIC / USER
router.get("/product/:productId", asyncHandler(getProductReviewsHandler));
router.post("/", authMiddleware(), validate(createReviewSchema), asyncHandler(createReviewHandler));

// STAFF & ADMIN
// MARKETING + SUPPORT có canReviews
router.get("/admin/all", ...staffAdminAuth, requirePermission("canReviews"), validate(listReviewsSchema, "query"), asyncHandler(getAllReviewsAdminHandler));

router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedReviewsHandler));

router.patch("/admin/bulk/approve", ...staffAdminAuth, requirePermission("canReviews"), validate(bulkApproveReviewSchema, "body"), asyncHandler(bulkApproveReviewsHandler));

router.delete("/admin/bulk", ...staffAdminAuth, requirePermission("canReviews"), validate(bulkDeleteReviewSchema, "body"), asyncHandler(bulkDeleteReviewsHandler));

router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreReviewSchema, "body"), asyncHandler(bulkRestoreReviewsHandler));

router.post("/admin/:id/restore", ...adminAuth, validate(reviewParamsSchema, "params"), asyncHandler(restoreReviewHandler));

router.delete("/admin/:id/permanent", ...adminAuth, validate(reviewParamsSchema, "params"), asyncHandler(hardDeleteReviewHandler));

router.patch("/admin/:id/approve", ...staffAdminAuth, requirePermission("canReviews"), validate(reviewParamsSchema, "params"), asyncHandler(approveReviewHandler));

router.get("/admin/:id", ...staffAdminAuth, requirePermission("canReviews"), validate(reviewParamsSchema, "params"), asyncHandler(getReviewDetailHandler));

router.patch(
  "/admin/:id",
  ...staffAdminAuth,
  requirePermission("canReviews"),
  validate(reviewParamsSchema, "params"),
  validate(updateReviewAdminSchema, "body"),
  asyncHandler(updateReviewAdminHandler),
);

router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canReviews"), validate(reviewParamsSchema, "params"), asyncHandler(deleteReviewAdminHandler));

export default router;
