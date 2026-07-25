import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getSuppliersAdminHandler,
  getActiveSuppliersLiteHandler,
  getSupplierDetailHandler,
  createSupplierHandler,
  updateSupplierHandler,
  deleteSupplierHandler,
  restoreSupplierHandler,
} from "./supplier.controller";
import { listSuppliersQuerySchema, supplierParamsSchema, createSupplierSchema, updateSupplierSchema } from "./supplier.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

router.get("/", ...adminAuth, validate(listSuppliersQuerySchema, "query"), asyncHandler(getSuppliersAdminHandler));
router.get("/active", ...adminAuth, asyncHandler(getActiveSuppliersLiteHandler));
router.post("/", ...adminAuth, validate(createSupplierSchema, "body"), asyncHandler(createSupplierHandler));

router.get("/:id", ...adminAuth, validate(supplierParamsSchema, "params"), asyncHandler(getSupplierDetailHandler));
router.patch("/:id", ...adminAuth, validate(supplierParamsSchema, "params"), validate(updateSupplierSchema, "body"), asyncHandler(updateSupplierHandler));
router.delete("/:id", ...adminAuth, validate(supplierParamsSchema, "params"), asyncHandler(deleteSupplierHandler));
router.post("/:id/restore", ...adminAuth, validate(supplierParamsSchema, "params"), asyncHandler(restoreSupplierHandler));

export default router;
