import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getVouchersPublicHandler,
  getVoucherByCodeHandler,
  validateVoucherHandler,
  getUserVouchersHandler,
  getVouchersAdminHandler,
  getVoucherByIdHandler,
  getDeletedVouchersHandler,
  createVoucherHandler,
  updateVoucherHandler,
  deleteVoucherHandler,
  bulkDeleteVouchersHandler,
  restoreVoucherHandler,
  hardDeleteVoucherHandler,
  assignVoucherToUsersHandler,
} from "./voucher.controller";
import {
  listVouchersSchema,
  voucherCodeParamsSchema,
  voucherParamsSchema,
  validateVoucherSchema,
  createVoucherSchema,
  updateVoucherSchema,
  assignVoucherToUsersSchema,
  bulkDeleteVouchersSchema,
} from "./voucher.validation";

const router = Router();
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listVouchersSchema, "query"), asyncHandler(getVouchersPublicHandler));
router.get("/my-vouchers", authMiddleware(), asyncHandler(getUserVouchersHandler));
router.get("/code/:code", validate(voucherCodeParamsSchema, "params"), asyncHandler(getVoucherByCodeHandler));
router.post("/validate", authMiddleware(), validate(validateVoucherSchema, "body"), asyncHandler(validateVoucherHandler));

// ── Admin — static routes (trước /:id) ────────────────────────────────────────
router.get("/admin/all", ...adminAuth, validate(listVouchersSchema, "query"), asyncHandler(getVouchersAdminHandler));

/** Thùng rác */
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedVouchersHandler));

/** Assign to users */
router.post("/admin/assign", ...adminAuth, validate(assignVoucherToUsersSchema, "body"), asyncHandler(assignVoucherToUsersHandler));

/** Bulk soft delete */
router.delete("/admin/bulk", ...adminAuth, validate(bulkDeleteVouchersSchema, "body"), asyncHandler(bulkDeleteVouchersHandler));

/** Create */
router.post("/admin", ...adminAuth, validate(createVoucherSchema, "body"), asyncHandler(createVoucherHandler));

// ── Admin — dynamic /:id ───────────────────────────────────────────────────────
router.get("/admin/:id", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(getVoucherByIdHandler));
router.patch("/admin/:id", ...adminAuth, validate(voucherParamsSchema, "params"), validate(updateVoucherSchema, "body"), asyncHandler(updateVoucherHandler));

/** Soft delete */
router.delete("/admin/:id", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(deleteVoucherHandler));

/** Khôi phục */
router.post("/admin/:id/restore", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(restoreVoucherHandler));

/** Xoá vĩnh viễn */
router.delete("/admin/:id/permanent", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(hardDeleteVoucherHandler));

export default router;
