import prisma from "@/config/db";
import * as repo from "./inventory.repository";
import * as warehouseRepo from "../warehouse/warehouse.repository";
import { getGlobalLowStockThreshold } from "./inventory.helpers";
import { NotFoundError, BadRequestError } from "@/errors";
import { StockInInput, StockOutInput, ListInventoryQuery, ListMovementsQuery, ListAlertsQuery, UpdateLowStockThresholdInput } from "./inventory.validation";

// Resolve kho làm việc: dùng warehouseId truyền vào, nếu không có thì lấy kho mặc định.
// Throw rõ ràng cho các thao tác chủ động (nhập/xuất/kiểm kê) — khác với hook tự động
// bên order/checkout vốn tự bỏ qua khi chưa có kho để không chặn checkout.
const resolveWarehouseId = async (warehouseId?: string): Promise<string> => {
  if (warehouseId) return warehouseId;
  const defaultId = await warehouseRepo.getDefaultWarehouseId();
  if (!defaultId) throw new BadRequestError("Chưa có kho hàng nào trong hệ thống. Hãy tạo kho ở mục Danh sách kho trước.");
  return defaultId;
};

// ============================================================================
// TỒN KHO SẢN PHẨM
// ============================================================================

const resolveThresholdForRow = (lowStockThreshold: number | null, globalDefault: number) => (lowStockThreshold ?? globalDefault);

export const getInventoryOverview = async (query: ListInventoryQuery) => {
  const globalThreshold = await getGlobalLowStockThreshold();
  const result = await repo.findInventoryOverview(query);

  const data = result.data.map((variant) => {
    const totalQuantity = variant.warehouseStocks.length > 0 ? variant.warehouseStocks.reduce((sum, s) => sum + s.quantity, 0) : variant.quantity;

    const stocks = variant.warehouseStocks.map((s) => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouse.name,
      quantity: s.quantity,
      lowStockThreshold: resolveThresholdForRow(s.lowStockThreshold, globalThreshold),
      isLowStock: s.quantity > 0 && s.quantity <= resolveThresholdForRow(s.lowStockThreshold, globalThreshold),
      isOutOfStock: s.quantity <= 0,
    }));

    const isOutOfStock = totalQuantity <= 0;
    const isLowStock = !isOutOfStock && stocks.some((s) => s.isLowStock);

    return {
      id: variant.id,
      code: variant.code,
      price: Number(variant.price),
      isActive: variant.isActive,
      product: variant.product,
      variantAttributes: variant.variantAttributes,
      totalQuantity,
      stocks,
      isLowStock,
      isOutOfStock,
    };
  });

  // Lọc theo stockStatus sau khi tính toán (vì phụ thuộc dữ liệu tổng hợp nhiều kho)
  const filtered = query.stockStatus && query.stockStatus !== "ALL" ? data.filter((v) => (query.stockStatus === "OUT_OF_STOCK" ? v.isOutOfStock : query.stockStatus === "LOW_STOCK" ? v.isLowStock : !v.isOutOfStock && !v.isLowStock)) : data;

  return { ...result, data: filtered };
};

export const getVariantInventoryDetail = async (variantId: string) => {
  const variant = await repo.findVariantInventoryDetail(variantId);
  if (!variant) throw new NotFoundError("Biến thể sản phẩm");
  return variant;
};

export const updateLowStockThreshold = async (variantId: string, input: UpdateLowStockThresholdInput) => {
  const variant = await repo.findVariantById(variantId);
  if (!variant) throw new NotFoundError("Biến thể sản phẩm");

  const warehouseId = await resolveWarehouseId(input.warehouseId);
  return repo.upsertLowStockThreshold(variantId, warehouseId, input.lowStockThreshold);
};

// ============================================================================
// NHẬP KHO
// ============================================================================

export const stockIn = async (input: StockInInput, performedBy: string) => {
  const warehouseId = await resolveWarehouseId(input.warehouseId);

  // Validate variant tồn tại trước khi vào transaction để trả lỗi rõ ràng
  for (const item of input.items) {
    const variant = await repo.findVariantById(item.productVariantId);
    if (!variant) throw new NotFoundError(`Biến thể sản phẩm ${item.productVariantId}`);
  }

  return prisma.$transaction((tx) =>
    repo.createStockInTx(tx, {
      warehouseId,
      supplierId: input.supplierId,
      reason: input.reason,
      note: input.note,
      items: input.items,
      performedBy,
    }),
  );
};

// ============================================================================
// XUẤT KHO
// ============================================================================

export const stockOut = async (input: StockOutInput, performedBy: string) => {
  const warehouseId = await resolveWarehouseId(input.warehouseId);

  for (const item of input.items) {
    const variant = await repo.findVariantById(item.productVariantId);
    if (!variant) throw new NotFoundError(`Biến thể sản phẩm ${item.productVariantId}`);
    if (variant.quantity < item.quantity) {
      throw new BadRequestError(`Không đủ tồn kho để xuất cho biến thể "${variant.code ?? variant.id}" (còn ${variant.quantity}, cần xuất ${item.quantity})`);
    }
  }

  return prisma.$transaction((tx) =>
    repo.createStockOutTx(tx, {
      warehouseId,
      reason: input.reason,
      note: input.note,
      items: input.items,
      performedBy,
    }),
  );
};

// ============================================================================
// LỊCH SỬ NHẬP/XUẤT
// ============================================================================

export const getMovementHistory = async (query: ListMovementsQuery) => repo.findMovements(query);

// ============================================================================
// CẢNH BÁO TỒN KHO THẤP
// ============================================================================

export const getLowStockAlerts = async (query: ListAlertsQuery) => {
  const globalThreshold = await getGlobalLowStockThreshold();
  const rows = await repo.findStockRowsForAlerts(query.warehouseId);

  const alerts = rows
    .filter((row) => row.productVariant.isActive && row.productVariant.deletedAt === null)
    .map((row) => {
      const threshold = resolveThresholdForRow(row.lowStockThreshold, globalThreshold);
      return {
        variantId: row.productVariant.id,
        variantCode: row.productVariant.code,
        productName: row.productVariant.product.name,
        productSlug: row.productVariant.product.slug,
        thumbnail: row.productVariant.product.img[0]?.imageUrl ?? null,
        warehouseId: row.warehouse.id,
        warehouseName: row.warehouse.name,
        quantity: row.quantity,
        lowStockThreshold: threshold,
        isOutOfStock: row.quantity <= 0,
      };
    })
    .filter((a) => a.quantity <= a.lowStockThreshold);

  const { page = 1, limit = 50 } = query;
  const total = alerts.length;
  const start = (page - 1) * limit;
  const data = alerts.slice(start, start + limit);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    outOfStockCount: alerts.filter((a) => a.isOutOfStock).length,
    lowStockCount: alerts.filter((a) => !a.isOutOfStock).length,
  };
};

// ============================================================================
// KHỞI TẠO TỒN KHO BAN ĐẦU
// ============================================================================

export const initializeWarehouseStock = async (warehouseIdInput: string | undefined, performedBy: string) => {
  const warehouseId = await resolveWarehouseId(warehouseIdInput);
  const initializedCount = await prisma.$transaction((tx) => repo.initializeWarehouseStockTx(tx, warehouseId, performedBy));
  return { warehouseId, initializedCount };
};
