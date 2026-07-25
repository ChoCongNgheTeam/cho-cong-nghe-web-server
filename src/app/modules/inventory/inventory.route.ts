import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getInventoryOverviewHandler,
  getVariantInventoryDetailHandler,
  updateLowStockThresholdHandler,
  stockInHandler,
  stockOutHandler,
  getMovementHistoryHandler,
  getLowStockAlertsHandler,
  initializeWarehouseStockHandler,
} from "./inventory.controller";
import {
  getStocktakesAdminHandler,
  getStocktakeDetailHandler,
  createStocktakeHandler,
  updateStocktakeItemsHandler,
  completeStocktakeHandler,
  cancelStocktakeHandler,
} from "./inventory-stocktake.controller";
import {
  listInventoryQuerySchema,
  listMovementsQuerySchema,
  listAlertsQuerySchema,
  updateLowStockThresholdSchema,
  initializeStockSchema,
  stockInSchema,
  stockOutSchema,
  variantParamsSchema,
  listStocktakesQuerySchema,
  createStocktakeSchema,
  updateStocktakeItemsSchema,
  stocktakeParamsSchema,
} from "./inventory.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ─── Tồn kho sản phẩm ──────────────────────────────────────────────────────
router.get("/", ...adminAuth, validate(listInventoryQuerySchema, "query"), asyncHandler(getInventoryOverviewHandler));

// ─── Cảnh báo tồn kho thấp ─────────────────────────────────────────────────
router.get("/alerts", ...adminAuth, validate(listAlertsQuerySchema, "query"), asyncHandler(getLowStockAlertsHandler));

// ─── Lịch sử nhập/xuất ─────────────────────────────────────────────────────
router.get("/movements", ...adminAuth, validate(listMovementsQuerySchema, "query"), asyncHandler(getMovementHistoryHandler));

// ─── Nhập kho / Xuất kho ───────────────────────────────────────────────────
router.post("/stock-in", ...adminAuth, validate(stockInSchema, "body"), asyncHandler(stockInHandler));
router.post("/stock-out", ...adminAuth, validate(stockOutSchema, "body"), asyncHandler(stockOutHandler));

// ─── Khởi tạo tồn kho ban đầu ───────────────────────────────────────────────
router.post("/initialize", ...adminAuth, validate(initializeStockSchema, "body"), asyncHandler(initializeWarehouseStockHandler));

// ─── Kiểm kê kho ───────────────────────────────────────────────────────────
router.get("/stocktakes", ...adminAuth, validate(listStocktakesQuerySchema, "query"), asyncHandler(getStocktakesAdminHandler));
router.post("/stocktakes", ...adminAuth, validate(createStocktakeSchema, "body"), asyncHandler(createStocktakeHandler));
router.get("/stocktakes/:id", ...adminAuth, validate(stocktakeParamsSchema, "params"), asyncHandler(getStocktakeDetailHandler));
router.patch(
  "/stocktakes/:id/items",
  ...adminAuth,
  validate(stocktakeParamsSchema, "params"),
  validate(updateStocktakeItemsSchema, "body"),
  asyncHandler(updateStocktakeItemsHandler),
);
router.post("/stocktakes/:id/complete", ...adminAuth, validate(stocktakeParamsSchema, "params"), asyncHandler(completeStocktakeHandler));
router.post("/stocktakes/:id/cancel", ...adminAuth, validate(stocktakeParamsSchema, "params"), asyncHandler(cancelStocktakeHandler));

// ─── Chi tiết tồn kho theo biến thể (đặt cuối vì là dynamic segment) ───────
router.get("/:variantId", ...adminAuth, validate(variantParamsSchema, "params"), asyncHandler(getVariantInventoryDetailHandler));
router.patch(
  "/:variantId/threshold",
  ...adminAuth,
  validate(variantParamsSchema, "params"),
  validate(updateLowStockThresholdSchema, "body"),
  asyncHandler(updateLowStockThresholdHandler),
);

export default router;
