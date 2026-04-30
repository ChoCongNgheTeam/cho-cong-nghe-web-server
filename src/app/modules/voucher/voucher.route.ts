import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
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
  getVoucherUsagesHandler,
  getVoucherUsersHandler,
  revokeVoucherUserHandler,
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
  listVoucherUsagesSchema,
  listVoucherUsersSchema,
} from "./voucher.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listVouchersSchema, "query"), asyncHandler(getVouchersPublicHandler));
router.get("/my-vouchers", authMiddleware(), asyncHandler(getUserVouchersHandler));
router.get("/code/:code", validate(voucherCodeParamsSchema, "params"), asyncHandler(getVoucherByCodeHandler));
router.post("/validate", authMiddleware(), validate(validateVoucherSchema, "body"), asyncHandler(validateVoucherHandler));

// ── Admin — static routes (trước /:id) ────────────────────────────────────────
// MARKETING có canVouchers — xem, tạo, sửa, xóa mềm
router.get("/admin/all", ...staffAdminAuth, requirePermission("canVouchers"), validate(listVouchersSchema, "query"), asyncHandler(getVouchersAdminHandler));

router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedVouchersHandler));

router.get("/admin/usages", ...staffAdminAuth, requirePermission("canVouchers"), validate(listVoucherUsagesSchema, "query"), asyncHandler(getVoucherUsagesHandler));
router.get("/admin/private-users", ...staffAdminAuth, requirePermission("canVouchers"), validate(listVoucherUsersSchema, "query"), asyncHandler(getVoucherUsersHandler));
router.delete("/admin/:voucherId/users/:userId", ...adminAuth, asyncHandler(revokeVoucherUserHandler));

router.post("/admin/assign", ...staffAdminAuth, requirePermission("canVouchers"), validate(assignVoucherToUsersSchema, "body"), asyncHandler(assignVoucherToUsersHandler));

router.delete("/admin/bulk", ...staffAdminAuth, requirePermission("canVouchers"), validate(bulkDeleteVouchersSchema, "body"), asyncHandler(bulkDeleteVouchersHandler));

router.post("/admin", ...staffAdminAuth, requirePermission("canVouchers"), validate(createVoucherSchema, "body"), asyncHandler(createVoucherHandler));

// ── Admin — dynamic /:id ───────────────────────────────────────────────────────
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canVouchers"), validate(voucherParamsSchema, "params"), asyncHandler(getVoucherByIdHandler));
router.patch("/admin/:id", ...staffAdminAuth, requirePermission("canVouchers"), validate(voucherParamsSchema, "params"), validate(updateVoucherSchema, "body"), asyncHandler(updateVoucherHandler));

router.delete("/admin/:id", ...staffAdminAuth, requirePermission("canVouchers"), validate(voucherParamsSchema, "params"), asyncHandler(deleteVoucherHandler));

// Restore + hard delete — ADMIN only
router.post("/admin/:id/restore", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(restoreVoucherHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(hardDeleteVoucherHandler));

export default router;
