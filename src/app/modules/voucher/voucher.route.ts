import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import {
  // Public handlers
  getVouchersPublicHandler,
  getVoucherByCodeHandler,
  validateVoucherHandler,
  getUserVouchersHandler,

  // Admin handlers
  getVouchersAdminHandler,
  getVoucherByIdHandler,
  createVoucherHandler,
  updateVoucherHandler,
  deleteVoucherHandler,
  assignVoucherToUsersHandler,
} from "./voucher.controller";
import { listVouchersSchema, voucherCodeParamsSchema, voucherParamsSchema, validateVoucherSchema, createVoucherSchema, updateVoucherSchema, assignVoucherToUsersSchema } from "./voucher.validation";

const router = Router();

// Public

// List vouchers
router.get("/", validate(listVouchersSchema, "query"), getVouchersPublicHandler);

// Get voucher by code
router.get("/code/:code", validate(voucherCodeParamsSchema, "params"), getVoucherByCodeHandler);

// Validate voucher
router.post("/validate", authMiddleware(), validate(validateVoucherSchema, "body"), validateVoucherHandler);

// Get user's vouchers
router.get("/my-vouchers", authMiddleware(), getUserVouchersHandler);

// Admin

// Get all vouchers (admin)
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listVouchersSchema, "query"), getVouchersAdminHandler);

// Assign voucher to users
router.post("/admin/assign", authMiddleware(), requireRole("ADMIN"), validate(assignVoucherToUsersSchema, "body"), assignVoucherToUsersHandler);

// Get voucher by ID (admin)
router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(voucherParamsSchema, "params"), getVoucherByIdHandler);

// Create voucher
router.post("/admin", authMiddleware(), requireRole("ADMIN"), validate(createVoucherSchema, "body"), createVoucherHandler);

// Update voucher
router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(voucherParamsSchema, "params"), validate(updateVoucherSchema, "body"), updateVoucherHandler);

// Delete voucher
router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(voucherParamsSchema, "params"), deleteVoucherHandler);

export default router;
