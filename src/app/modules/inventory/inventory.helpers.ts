import { nanoid } from "nanoid";
import { StockMovementType } from "@prisma/client";
import { getSettingValue } from "../settings/settings.service";

const MOVEMENT_PREFIX: Record<StockMovementType, string> = {
  STOCK_IN: "IN",
  STOCK_OUT: "OUT",
  SALE: "SAL",
  RETURN: "RET",
  ADJUSTMENT: "ADJ",
};

export const generateMovementCode = (type: StockMovementType): string => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `${MOVEMENT_PREFIX[type]}-${datePart}-${nanoid(6).toUpperCase()}`;
};

export const generateStocktakeCode = (): string => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `ST-${datePart}-${nanoid(6).toUpperCase()}`;
};

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// Ngưỡng cảnh báo mặc định toàn hệ thống — admin cấu hình ở Cài đặt hệ thống
// (group "inventory", key "low_stock_default_threshold"). Ngưỡng riêng theo từng
// variant/kho (variant_warehouse_stocks.lowStockThreshold) luôn được ưu tiên hơn.
export const getGlobalLowStockThreshold = async (): Promise<number> => {
  const raw = await getSettingValue("inventory", "low_stock_default_threshold");
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_LOW_STOCK_THRESHOLD;
};
