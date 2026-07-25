import prisma from "@/config/db";
import { Prisma, StockMovementType, StockMovementReason } from "@prisma/client";
import { inventoryVariantSelect, stockMovementSelectAdmin } from "./inventory.types";
import { generateMovementCode } from "./inventory.helpers";
import { ListInventoryQuery, ListMovementsQuery, ListAlertsQuery } from "./inventory.validation";

// ============================================================================
// CORE ENGINE — nơi duy nhất ghi biến động tồn kho (dùng nội bộ module này,
// và được các module khác — order, checkout — import để giữ tồn kho đồng bộ
// khi tạo/hủy đơn hàng).
// ============================================================================

export interface ApplyStockMovementParams {
  productVariantId: string;
  warehouseId: string;
  /** Dương = tăng tồn kho (nhập, hoàn hàng). Âm = giảm tồn kho (xuất, bán). */
  quantityDelta: number;
  type: StockMovementType;
  reason: StockMovementReason;
  unitCost?: number;
  supplierId?: string;
  orderId?: string;
  stocktakeId?: string;
  note?: string;
  performedBy?: string;
}

export interface ApplyStockMovementOptions {
  /**
   * Có tự cộng/trừ products_variants.quantity (tổng denormalized) hay không.
   * Mặc định true. Set false khi caller (order/checkout module) đã tự cập nhật
   * quantity ở nơi khác trong cùng transaction — tránh cộng/trừ 2 lần.
   */
  syncVariantQuantity?: boolean;
}

/**
 * Ghi 1 biến động tồn kho: cập nhật variant_warehouse_stocks (nguồn sự thật theo kho),
 * tạo dòng stock_movements (sổ cái lịch sử), và tuỳ chọn đồng bộ products_variants.quantity.
 * PHẢI được gọi bên trong 1 Prisma transaction (tx) để đảm bảo tính toàn vẹn.
 */
export const applyStockMovementTx = async (tx: Prisma.TransactionClient, params: ApplyStockMovementParams, options: ApplyStockMovementOptions = {}) => {
  const { productVariantId, warehouseId, quantityDelta, type, reason, unitCost, supplierId, orderId, stocktakeId, note, performedBy } = params;
  const { syncVariantQuantity = true } = options;

  if (quantityDelta === 0) return null;

  const stockRow = await tx.variant_warehouse_stocks.upsert({
    where: { productVariantId_warehouseId: { productVariantId, warehouseId } },
    create: { productVariantId, warehouseId, quantity: Math.max(quantityDelta, 0) },
    update: { quantity: { increment: quantityDelta } },
  });

  // Không để tồn kho theo kho bị âm (có thể xảy ra ở lần xuất/bán đầu tiên khi
  // warehouse stock chưa được khởi tạo từ products_variants.quantity cũ)
  if (stockRow.quantity < 0) {
    await tx.variant_warehouse_stocks.update({ where: { id: stockRow.id }, data: { quantity: 0 } });
  }

  const movement = await tx.stock_movements.create({
    data: {
      code: generateMovementCode(type),
      type,
      reason,
      productVariantId,
      warehouseId,
      quantity: Math.abs(quantityDelta),
      ...(unitCost != null && { unitCost: new Prisma.Decimal(unitCost) }),
      supplierId,
      orderId,
      stocktakeId,
      note: note || null,
      performedBy,
    },
    select: stockMovementSelectAdmin,
  });

  if (syncVariantQuantity) {
    await tx.products_variants.update({
      where: { id: productVariantId },
      data: { quantity: { increment: quantityDelta } },
    });
  }

  return { stockRow, movement };
};

// ============================================================================
// TỒN KHO SẢN PHẨM
// ============================================================================

export const findInventoryOverview = async (query: ListInventoryQuery) => {
  const { page = 1, limit = 20, search, warehouseId, categoryId, brandId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.products_variantsWhereInput = { deletedAt: null };

  if (search?.trim()) {
    where.OR = [{ code: { contains: search.trim(), mode: "insensitive" } }, { product: { name: { contains: search.trim(), mode: "insensitive" } } }];
  }
  if (categoryId) where.product = { ...(where.product as object), categoryId };
  if (brandId) where.product = { ...(where.product as object), brandId };
  if (warehouseId) where.warehouseStocks = { some: { warehouseId } };

  const [data, total] = await prisma.$transaction([
    prisma.products_variants.findMany({ where, select: inventoryVariantSelect, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.products_variants.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findVariantInventoryDetail = async (variantId: string) => {
  return prisma.products_variants.findFirst({ where: { id: variantId, deletedAt: null }, select: inventoryVariantSelect });
};

export const findVariantById = async (variantId: string) => {
  return prisma.products_variants.findFirst({
    where: { id: variantId, deletedAt: null },
    select: { id: true, code: true, quantity: true, isActive: true, product: { select: { name: true } } },
  });
};

// ============================================================================
// LỊCH SỬ NHẬP/XUẤT
// ============================================================================

export const findMovements = async (query: ListMovementsQuery) => {
  const { page = 1, limit = 20, type, reason, warehouseId, productVariantId, supplierId, dateFrom, dateTo } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.stock_movementsWhereInput = {};
  if (type) where.type = type;
  if (reason) where.reason = reason;
  if (warehouseId) where.warehouseId = warehouseId;
  if (productVariantId) where.productVariantId = productVariantId;
  if (supplierId) where.supplierId = supplierId;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }),
    };
  }

  const [data, total] = await prisma.$transaction([
    prisma.stock_movements.findMany({ where, select: stockMovementSelectAdmin, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.stock_movements.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// ============================================================================
// NHẬP KHO / XUẤT KHO — thao tác thủ công qua UI admin
// ============================================================================

export const createStockInTx = async (
  tx: Prisma.TransactionClient,
  params: { warehouseId: string; supplierId?: string; reason: StockMovementReason; note?: string; items: { productVariantId: string; quantity: number; unitCost?: number }[]; performedBy: string },
) => {
  const results = [];
  for (const item of params.items) {
    const result = await applyStockMovementTx(tx, {
      productVariantId: item.productVariantId,
      warehouseId: params.warehouseId,
      quantityDelta: item.quantity,
      type: "STOCK_IN",
      reason: params.reason,
      unitCost: item.unitCost,
      supplierId: params.supplierId,
      note: params.note,
      performedBy: params.performedBy,
    });
    results.push(result);
  }
  return results;
};

export const createStockOutTx = async (
  tx: Prisma.TransactionClient,
  params: { warehouseId: string; reason: StockMovementReason; note?: string; items: { productVariantId: string; quantity: number }[]; performedBy: string },
) => {
  const results = [];
  for (const item of params.items) {
    const result = await applyStockMovementTx(tx, {
      productVariantId: item.productVariantId,
      warehouseId: params.warehouseId,
      quantityDelta: -item.quantity,
      type: "STOCK_OUT",
      reason: params.reason,
      note: params.note,
      performedBy: params.performedBy,
    });
    results.push(result);
  }
  return results;
};

// ============================================================================
// CẢNH BÁO TỒN KHO THẤP
// ============================================================================

export const findStockRowsForAlerts = async (warehouseId?: string) => {
  return prisma.variant_warehouse_stocks.findMany({
    where: { ...(warehouseId && { warehouseId }) },
    select: {
      id: true,
      quantity: true,
      lowStockThreshold: true,
      warehouse: { select: { id: true, name: true, code: true } },
      productVariant: {
        select: {
          id: true,
          code: true,
          isActive: true,
          deletedAt: true,
          product: { select: { id: true, name: true, slug: true, img: { select: { imageUrl: true }, take: 1 } } },
        },
      },
    },
    orderBy: { quantity: "asc" },
  });
};

export const upsertLowStockThreshold = async (productVariantId: string, warehouseId: string, threshold: number) => {
  return prisma.variant_warehouse_stocks.upsert({
    where: { productVariantId_warehouseId: { productVariantId, warehouseId } },
    create: { productVariantId, warehouseId, quantity: 0, lowStockThreshold: threshold },
    update: { lowStockThreshold: threshold },
  });
};

// ============================================================================
// KHỞI TẠO TỒN KHO BAN ĐẦU CHO 1 KHO (chạy 1 lần khi mới setup kho mặc định)
// ============================================================================

export const findVariantsWithoutStockRow = async (warehouseId: string) => {
  return prisma.products_variants.findMany({
    where: { deletedAt: null, warehouseStocks: { none: { warehouseId } } },
    select: { id: true, quantity: true },
  });
};

export const initializeWarehouseStockTx = async (tx: Prisma.TransactionClient, warehouseId: string, performedBy: string) => {
  const variants = await tx.products_variants.findMany({
    where: { deletedAt: null, warehouseStocks: { none: { warehouseId } } },
    select: { id: true, quantity: true },
  });

  let count = 0;
  for (const variant of variants) {
    if (variant.quantity <= 0) continue;
    await applyStockMovementTx(
      tx,
      {
        productVariantId: variant.id,
        warehouseId,
        quantityDelta: variant.quantity,
        type: "ADJUSTMENT",
        reason: "INITIAL_STOCK",
        note: "Khởi tạo tồn kho ban đầu từ dữ liệu sản phẩm hiện có",
        performedBy,
      },
      { syncVariantQuantity: false }, // quantity gốc đã đúng sẵn — không cộng thêm
    );
    count++;
  }
  return count;
};
