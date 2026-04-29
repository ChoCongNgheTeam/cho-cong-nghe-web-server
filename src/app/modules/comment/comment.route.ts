import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getCommentsPublicHandler,
  getCommentRepliesHandler,
  createCommentHandler,
  deleteOwnCommentHandler,
  getCommentsAdminHandler,
  getCommentDetailHandler,
  updateCommentHandler,
  approveCommentHandler,
  bulkApproveCommentsHandler,
  deleteCommentHandler,
  bulkDeleteCommentsHandler,
  restoreCommentHandler,
  bulkRestoreCommentsHandler,
  hardDeleteCommentHandler,
  getDeletedCommentsHandler,
} from "./comment.controller";
import { listCommentsSchema, commentParamsSchema, createCommentSchema, updateCommentSchema, approveCommentSchema, bulkApproveSchema, bulkDeleteSchema, bulkRestoreSchema } from "./comment.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listCommentsSchema, "query"), asyncHandler(getCommentsPublicHandler));
router.get("/:id/replies", validate(commentParamsSchema, "params"), asyncHandler(getCommentRepliesHandler));
router.delete("/:id", authMiddleware(), validate(commentParamsSchema, "params"), asyncHandler(deleteOwnCommentHandler));
router.post("/", authMiddleware(), validate(createCommentSchema, "body"), asyncHandler(createCommentHandler));

// ── Staff & Admin — MARKETING + SUPPORT có canComments ────────────────────────
router.get("/admin/all", ...staffAdminAuth, requirePermission("canComments"), validate(listCommentsSchema, "query"), asyncHandler(getCommentsAdminHandler));
router.patch("/admin/bulk/approve", ...staffAdminAuth, requirePermission("canComments"), validate(bulkApproveSchema, "body"), asyncHandler(bulkApproveCommentsHandler));
router.delete("/admin/bulk", ...staffAdminAuth, requirePermission("canComments"), validate(bulkDeleteSchema, "body"), asyncHandler(bulkDeleteCommentsHandler));
router.patch(
  "/admin/:id/approve",
  ...staffAdminAuth,
  requirePermission("canComments"),
  validate(commentParamsSchema, "params"),
  validate(approveCommentSchema, "body"),
  asyncHandler(approveCommentHandler),
);
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canComments"), validate(commentParamsSchema, "params"), asyncHandler(getCommentDetailHandler));
router.patch("/admin/:id", ...staffAdminAuth, requirePermission("canComments"), validate(commentParamsSchema, "params"), validate(updateCommentSchema, "body"), asyncHandler(updateCommentHandler));
router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canComments"), validate(commentParamsSchema, "params"), asyncHandler(deleteCommentHandler));

// ── Admin only — trash & restore ───────────────────────────────────────────────
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedCommentsHandler));
router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreSchema, "body"), asyncHandler(bulkRestoreCommentsHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(commentParamsSchema, "params"), asyncHandler(restoreCommentHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(commentParamsSchema, "params"), asyncHandler(hardDeleteCommentHandler));

export default router;
