import { Prisma } from "@prisma/client";

// Select dùng cho admin — kho hàng chỉ dùng nội bộ, không có view public
export const warehouseSelectAdmin = {
  id: true,
  code: true,
  name: true,
  address: true,
  phone: true,
  managerName: true,
  note: true,
  isDefault: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
} satisfies Prisma.warehousesSelect;

// Select rút gọn — dùng cho dropdown chọn kho ở các module khác (inventory, stocktake...)
export const warehouseSelectLite = {
  id: true,
  code: true,
  name: true,
  isDefault: true,
  isActive: true,
} satisfies Prisma.warehousesSelect;

export type WarehouseAdminRow = Prisma.warehousesGetPayload<{ select: typeof warehouseSelectAdmin }>;
export type WarehouseLiteRow = Prisma.warehousesGetPayload<{ select: typeof warehouseSelectLite }>;
