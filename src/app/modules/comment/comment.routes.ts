import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import {
  getCommentsPublicHandler,
  getCommentRepliesHandler,
  createCommentHandler,
  deleteOwnCommentHandler,
  getCommentsAdminHandler,
  getCommentDetailHandler,
  updateCommentHandler,
  approveCommentHandler,
  deleteCommentHandler,
  bulkApproveCommentsHandler,
} from "./comment.controller";
import {
  listCommentsSchema,
  commentParamsSchema,
  createCommentSchema,
  updateCommentSchema,
  approveCommentSchema,
} from "./comment.validation";

const router = Router();

// =====================
// === PUBLIC ROUTES ===
// =====================

/**
 * Get approved comments (with filters)
 * GET /api/comments?targetType=BLOG&targetId=xxx
 */
router.get("/", validate(listCommentsSchema, "query"), getCommentsPublicHandler);

/**
 * Get replies for a comment
 * GET /api/comments/:id/replies
 */
router.get("/:id/replies", validate(commentParamsSchema, "params"), getCommentRepliesHandler);

// =====================
// === AUTHENTICATED ROUTES ===
// =====================

/**
 * Create comment
 * POST /api/comments
 */
router.post("/", authMiddleware, validate(createCommentSchema, "body"), createCommentHandler);

/**
 * Delete own comment
 * DELETE /api/comments/:id
 */
router.delete(
  "/:id",
  authMiddleware,
  validate(commentParamsSchema, "params"),
  deleteOwnCommentHandler,
);

// =====================
// === ADMIN ROUTES ===
// =====================

/**
 * Get all comments (admin - includes not approved)
 * GET /api/comments/admin/all
 */
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listCommentsSchema, "query"),
  getCommentsAdminHandler,
);

/**
 * Get comment by ID (admin)
 * GET /api/comments/admin/:id
 */
router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(commentParamsSchema, "params"),
  getCommentDetailHandler,
);

/**
 * Update comment (admin)
 * PATCH /api/comments/admin/:id
 */
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(commentParamsSchema, "params"),
  validate(updateCommentSchema, "body"),
  updateCommentHandler,
);

/**
 * Approve/Reject comment (admin)
 * PATCH /api/comments/admin/:id/approve
 */
router.patch(
  "/admin/:id/approve",
  authMiddleware,
  requireRole("ADMIN"),
  validate(commentParamsSchema, "params"),
  validate(approveCommentSchema, "body"),
  approveCommentHandler,
);

/**
 * Delete comment (admin)
 * DELETE /api/comments/admin/:id
 */
router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(commentParamsSchema, "params"),
  deleteCommentHandler,
);

/**
 * Bulk approve/reject comments (admin)
 * PATCH /api/comments/admin/bulk/approve
 */
router.patch(
  "/admin/bulk/approve",
  authMiddleware,
  requireRole("ADMIN"),
  bulkApproveCommentsHandler,
);

export default router;
