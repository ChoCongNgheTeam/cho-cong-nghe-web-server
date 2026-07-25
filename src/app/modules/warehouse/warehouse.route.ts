import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getWarehousesAdminHandler,
  getActiveWarehousesLiteHandler,
  getWarehouseDetailHandler,
  createWarehouseHandler,
  updateWarehouseHandler,
  deleteWarehouseHandler,
  restoreWarehouseHandler,
  setDefaultWarehouseHandler,
} from "./warehouse.controller";
import { listWarehousesQuerySchema, warehouseParamsSchema, createWarehouseSchema, updateWarehouseSchema } from "./warehouse.validation";

const router = Router();

// Module Kho hàng chỉ dành cho ADMIN — mirror phân quyền hiện tại của các module quản trị khác.
// Field canManageWarehouses trong staff_permissions dùng để FE ẩn/hiện UI cho STAFF trong tương lai.
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

router.get("/", ...adminAuth, validate(listWarehousesQuerySchema, "query"), asyncHandler(getWarehousesAdminHandler));
router.get("/active", ...adminAuth, asyncHandler(getActiveWarehousesLiteHandler));
router.post("/", ...adminAuth, validate(createWarehouseSchema, "body"), asyncHandler(createWarehouseHandler));

router.get("/:id", ...adminAuth, validate(warehouseParamsSchema, "params"), asyncHandler(getWarehouseDetailHandler));
router.patch("/:id", ...adminAuth, validate(warehouseParamsSchema, "params"), validate(updateWarehouseSchema, "body"), asyncHandler(updateWarehouseHandler));
router.delete("/:id", ...adminAuth, validate(warehouseParamsSchema, "params"), asyncHandler(deleteWarehouseHandler));
router.post("/:id/restore", ...adminAuth, validate(warehouseParamsSchema, "params"), asyncHandler(restoreWarehouseHandler));
router.post("/:id/set-default", ...adminAuth, validate(warehouseParamsSchema, "params"), asyncHandler(setDefaultWarehouseHandler));

export default router;
