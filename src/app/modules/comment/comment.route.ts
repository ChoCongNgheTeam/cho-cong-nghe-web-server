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

// Public
router.get("/", validate(listCommentsSchema, "query"), getCommentsPublicHandler);
router.get("/:id/replies", validate(commentParamsSchema, "params"), getCommentRepliesHandler);

// Authenticated
router.post("/", authMiddleware, validate(createCommentSchema, "body"), createCommentHandler);
router.delete(
  "/:id",
  authMiddleware,
  validate(commentParamsSchema, "params"),
  deleteOwnCommentHandler,
);

// Admin
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listCommentsSchema, "query"),
  getCommentsAdminHandler,
);

router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(commentParamsSchema, "params"),
  getCommentDetailHandler,
);

router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateCommentSchema, "body"),
  validate(commentParamsSchema, "params"),
  updateCommentHandler,
);

router.patch(
  "/admin/:id/approve",
  authMiddleware,
  requireRole("ADMIN"),
  validate(approveCommentSchema, "body"),
  validate(commentParamsSchema, "params"),
  approveCommentHandler,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(commentParamsSchema, "params"),
  deleteCommentHandler,
);

router.patch(
  "/admin/bulk/approve",
  authMiddleware,
  requireRole("ADMIN"),
  bulkApproveCommentsHandler,
);

export default router;
