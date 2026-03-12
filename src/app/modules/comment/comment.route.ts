import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
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

const router = Router();

//  Middleware shortcuts

const staffAdminAuth = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

//  Public

router.get("/", validate(listCommentsSchema, "query"), asyncHandler(getCommentsPublicHandler));

router.get("/:id/replies", validate(commentParamsSchema, "params"), asyncHandler(getCommentRepliesHandler));

// DELETE /comments/:id         User tự soft delete comment của mình
//                              Replies KHÔNG bị kéo theo
router.delete("/:id", authMiddleware(), validate(commentParamsSchema, "params"), asyncHandler(deleteOwnCommentHandler));

//  Admin

router.post("/", authMiddleware(), validate(createCommentSchema, "body"), asyncHandler(createCommentHandler));

router.get("/admin/all", ...staffAdminAuth, validate(listCommentsSchema, "query"), asyncHandler(getCommentsAdminHandler));

router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedCommentsHandler));

router.patch("/admin/bulk/approve", ...staffAdminAuth, validate(bulkApproveSchema, "body"), asyncHandler(bulkApproveCommentsHandler));

router.delete("/admin/bulk", ...staffAdminAuth, validate(bulkDeleteSchema, "body"), asyncHandler(bulkDeleteCommentsHandler));

router.post("/admin/bulk/restore", ...adminAuth, validate(bulkRestoreSchema, "body"), asyncHandler(bulkRestoreCommentsHandler));

router.post("/admin/:id/restore", ...adminAuth, validate(commentParamsSchema, "params"), asyncHandler(restoreCommentHandler));

router.delete("/admin/:id/permanent", ...adminAuth, validate(commentParamsSchema, "params"), asyncHandler(hardDeleteCommentHandler));

router.patch("/admin/:id/approve", ...staffAdminAuth, validate(commentParamsSchema, "params"), validate(approveCommentSchema, "body"), asyncHandler(approveCommentHandler));

router.get("/admin/:id", ...staffAdminAuth, validate(commentParamsSchema, "params"), asyncHandler(getCommentDetailHandler));

router.patch("/admin/:id", ...staffAdminAuth, validate(commentParamsSchema, "params"), validate(updateCommentSchema, "body"), asyncHandler(updateCommentHandler));

router.delete("/admin/:id", ...staffAdminAuth, validate(commentParamsSchema, "params"), asyncHandler(deleteCommentHandler));

export default router;
