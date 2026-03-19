import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
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

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public / User ──────────────────────────────────────────────────────────

router.get("/product/:productId", asyncHandler(getProductReviewsHandler));
router.post("/", authMiddleware(), validate(createReviewSchema), asyncHandler(createReviewHandler));

// ── Staff & Admin ──────────────────────────────────────────────────────────

router.get("/admin/all", ...staffAdminAuth, validate(listReviewsSchema, "query"), asyncHandler(getAllReviewsAdminHandler));

router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedReviewsHandler));

router.patch("/admin/bulk/approve", ...staffAdminAuth, validate(bulkApproveReviewSchema, "body"), asyncHandler(bulkApproveReviewsHandler));

router.delete("/admin/bulk", ...staffAdminAuth, validate(bulkDeleteReviewSchema, "body"), asyncHandler(bulkDeleteReviewsHandler));

router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreReviewSchema, "body"), asyncHandler(bulkRestoreReviewsHandler));

router.post("/admin/:id/restore", ...adminAuth, validate(reviewParamsSchema, "params"), asyncHandler(restoreReviewHandler));

router.delete("/admin/:id/permanent", ...adminAuth, validate(reviewParamsSchema, "params"), asyncHandler(hardDeleteReviewHandler));

router.patch("/admin/:id/approve", ...staffAdminAuth, validate(reviewParamsSchema, "params"), asyncHandler(approveReviewHandler));

router.get("/admin/:id", ...staffAdminAuth, validate(reviewParamsSchema, "params"), asyncHandler(getReviewDetailHandler));

router.patch("/admin/:id", ...staffAdminAuth, validate(reviewParamsSchema, "params"), validate(updateReviewAdminSchema, "body"), asyncHandler(updateReviewAdminHandler));

router.delete("/admin/:id", ...staffAdminAuth, validate(reviewParamsSchema, "params"), asyncHandler(deleteReviewAdminHandler));

export default router;
