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
import { listCommentsSchema, commentParamsSchema, createCommentSchema, updateCommentSchema, approveCommentSchema, bulkApproveSchema } from "./comment.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listCommentsSchema, "query"), asyncHandler(getCommentsPublicHandler));
router.get("/:id/replies", validate(commentParamsSchema, "params"), asyncHandler(getCommentRepliesHandler));

// Authenticated
router.post("/", authMiddleware(), validate(createCommentSchema, "body"), asyncHandler(createCommentHandler));
router.delete("/:id", authMiddleware(), validate(commentParamsSchema, "params"), asyncHandler(deleteOwnCommentHandler));

//  Admin — tĩnh
router.get("/admin/all", ...adminAuth, validate(listCommentsSchema, "query"), asyncHandler(getCommentsAdminHandler));

// bulk trước /:id để tránh "bulk" bị bắt như một id
router.patch("/admin/bulk/approve", ...adminAuth, validate(bulkApproveSchema, "body"), asyncHandler(bulkApproveCommentsHandler));

// Admin — động sau
router.get("/admin/:id", ...adminAuth, validate(commentParamsSchema, "params"), asyncHandler(getCommentDetailHandler));

router.patch("/admin/:id", ...adminAuth, validate(commentParamsSchema, "params"), validate(updateCommentSchema, "body"), asyncHandler(updateCommentHandler));

router.patch("/admin/:id/approve", ...adminAuth, validate(commentParamsSchema, "params"), validate(approveCommentSchema, "body"), asyncHandler(approveCommentHandler));

router.delete("/admin/:id", ...adminAuth, validate(commentParamsSchema, "params"), asyncHandler(deleteCommentHandler));

export default router;
