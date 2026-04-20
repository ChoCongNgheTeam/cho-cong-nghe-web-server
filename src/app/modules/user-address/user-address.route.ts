import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./user-address.controller";
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
  listAddressesQuerySchema,
} from "./user-address.validation";

const router = Router();

// ==================== PROTECTED ROUTES (tất cả phải đăng nhập) ====================

router.use(authMiddleware(true));

// --- User ---
router.get("/", asyncHandler(c.getUserAddressesHandler));
router.get("/default", asyncHandler(c.getDefaultAddressHandler));
router.get("/:addressId", validate(addressIdSchema, "params"), asyncHandler(c.getAddressHandler));
router.post("/", validate(createAddressSchema, "body"), asyncHandler(c.createAddressHandler));
router.patch("/:addressId", validate(addressIdSchema, "params"), validate(updateAddressSchema, "body"), asyncHandler(c.updateAddressHandler));
router.delete("/:addressId", validate(addressIdSchema, "params"), asyncHandler(c.deleteAddressHandler));
router.put("/:addressId/set-default", validate(addressIdSchema, "params"), asyncHandler(c.setDefaultAddressHandler));

// --- Staff & Admin ---
router.get("/admin/all", requireRole("STAFF", "ADMIN"), validate(listAddressesQuerySchema, "query"), asyncHandler(c.getAllAddressesAdminHandler));
router.delete("/admin/:addressId", requireRole("STAFF", "ADMIN"), validate(addressIdSchema, "params"), asyncHandler(c.softDeleteAddressAdminHandler));

// --- Admin only (trash & hard delete) ---
router.get("/admin/trash/addresses", requireRole("ADMIN"), asyncHandler(c.getDeletedAddressesHandler));
router.post("/admin/:addressId/restore", requireRole("ADMIN"), validate(addressIdSchema, "params"), asyncHandler(c.restoreAddressHandler));
router.delete("/admin/:addressId/permanent", requireRole("ADMIN"), validate(addressIdSchema, "params"), asyncHandler(c.hardDeleteAddressHandler));

export default router;