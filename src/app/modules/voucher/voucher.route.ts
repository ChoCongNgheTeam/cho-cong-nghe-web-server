import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import {
  getVouchersPublicHandler,
  getVoucherByCodeHandler,
  validateVoucherHandler,
  getUserVouchersHandler,
  getVouchersAdminHandler,
  getVoucherByIdHandler,
  createVoucherHandler,
  updateVoucherHandler,
  deleteVoucherHandler,
  assignVoucherToUsersHandler,
} from "./voucher.controller";
import { listVouchersSchema, voucherCodeParamsSchema, voucherParamsSchema, validateVoucherSchema, createVoucherSchema, updateVoucherSchema, assignVoucherToUsersSchema } from "./voucher.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — tĩnh trước
router.get("/", validate(listVouchersSchema, "query"), asyncHandler(getVouchersPublicHandler));
router.get("/my-vouchers", authMiddleware(), asyncHandler(getUserVouchersHandler));
router.get("/code/:code", validate(voucherCodeParamsSchema, "params"), asyncHandler(getVoucherByCodeHandler));
router.post("/validate", authMiddleware(), validate(validateVoucherSchema, "body"), asyncHandler(validateVoucherHandler));

// Admin — tĩnh trước
router.get("/admin/all", ...adminAuth, validate(listVouchersSchema, "query"), asyncHandler(getVouchersAdminHandler));
router.post("/admin/assign", ...adminAuth, validate(assignVoucherToUsersSchema, "body"), asyncHandler(assignVoucherToUsersHandler));
router.post("/admin", ...adminAuth, validate(createVoucherSchema, "body"), asyncHandler(createVoucherHandler));

// Admin — động sau
router.get("/admin/:id", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(getVoucherByIdHandler));
router.patch("/admin/:id", ...adminAuth, validate(voucherParamsSchema, "params"), validate(updateVoucherSchema, "body"), asyncHandler(updateVoucherHandler));
router.delete("/admin/:id", ...adminAuth, validate(voucherParamsSchema, "params"), asyncHandler(deleteVoucherHandler));

export default router;
