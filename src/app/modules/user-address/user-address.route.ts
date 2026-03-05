import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./user-address.controller";
import {
  createAddressSchema, updateAddressSchema, addressIdSchema, provinceIdSchema, 
  wardSearchSchema, createProvinceSchema, createWardSchema, listAddressesQuerySchema
} from "./user-address.validation";

const router = Router();

// ==================== LOCATION ROUTES (PUBLIC & ADMIN) ====================

router.get("/locations/provinces", asyncHandler(c.getProvincesHandler));
router.get("/locations/:provinceId/wards", validate(provinceIdSchema, "params"), validate(wardSearchSchema, "query"), asyncHandler(c.getWardsByProvinceHandler));

// Tạo Location (Admin Only)
router.post("/locations/provinces", authMiddleware(true), requireRole("ADMIN"), validate(createProvinceSchema, "body"), asyncHandler(c.createProvinceHandler));
router.post("/locations/wards", authMiddleware(true), requireRole("ADMIN"), validate(createWardSchema, "body"), asyncHandler(c.createWardHandler));

// ==================== ADDRESS ROUTES (PROTECTED) ====================

router.use(authMiddleware(true));

// User Roles
router.get("/", asyncHandler(c.getUserAddressesHandler));
router.get("/default", asyncHandler(c.getDefaultAddressHandler));
router.get("/:addressId", validate(addressIdSchema, "params"), asyncHandler(c.getAddressHandler));
router.post("/", validate(createAddressSchema, "body"), asyncHandler(c.createAddressHandler));
router.patch("/:addressId", validate(addressIdSchema, "params"), validate(updateAddressSchema, "body"), asyncHandler(c.updateAddressHandler));
router.delete("/:addressId", validate(addressIdSchema, "params"), asyncHandler(c.deleteAddressHandler));


router.put("/:addressId/set-default", validate(addressIdSchema, "params"), asyncHandler(c.setDefaultAddressHandler));

// ==================== STAFF & ADMIN ====================

router.get("/admin/all", requireRole("STAFF", "ADMIN"), validate(listAddressesQuerySchema, "query"), asyncHandler(c.getAllAddressesAdminHandler));
router.delete("/admin/:addressId", requireRole("STAFF", "ADMIN"), validate(addressIdSchema, "params"), asyncHandler(c.softDeleteAddressAdminHandler));

// ==================== TRASH & HARD DELETE (ADMIN ONLY) ====================

router.get("/admin/trash/addresses", requireRole("ADMIN"), asyncHandler(c.getDeletedAddressesHandler));
router.post("/admin/:addressId/restore", requireRole("ADMIN"), validate(addressIdSchema, "params"), asyncHandler(c.restoreAddressHandler));
router.delete("/admin/:addressId/permanent", requireRole("ADMIN"), validate(addressIdSchema, "params"), asyncHandler(c.hardDeleteAddressHandler));

export default router;