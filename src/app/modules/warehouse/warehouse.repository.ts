import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { warehouseSelectAdmin, warehouseSelectLite } from "./warehouse.types";
import { CreateWarehouseInput, UpdateWarehouseInput, ListWarehousesQuery } from "./warehouse.validation";

const buildWhere = (query: ListWarehousesQuery): Prisma.warehousesWhereInput => {
  const where: Prisma.warehousesWhereInput = {};

  if (!query.includeDeleted) where.deletedAt = null;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
      { address: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

export const checkCodeExists = async (code: string, excludeId?: string): Promise<boolean> => {
  const warehouse = await prisma.warehouses.findFirst({ where: { code, deletedAt: null }, select: { id: true } });
  if (!warehouse) return false;
  if (excludeId && warehouse.id === excludeId) return false;
  return true;
};

export const findAllAdmin = async (query: ListWarehousesQuery) => {
  const { page = 1, limit = 20, sortBy = "name", sortOrder = "asc" } = query;
  const skip = (page - 1) * limit;
  const where = buildWhere(query);

  const [data, total] = await prisma.$transaction([
    prisma.warehouses.findMany({ where, select: warehouseSelectAdmin, orderBy: { [sortBy]: sortOrder }, skip, take: limit }),
    prisma.warehouses.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// Danh sách rút gọn cho dropdown (dùng ở module inventory/stocktake)
export const findAllActiveLite = async () => {
  return prisma.warehouses.findMany({
    where: { isActive: true, deletedAt: null },
    select: warehouseSelectLite,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
};

export const findById = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const { includeDeleted = false } = options;
  return prisma.warehouses.findFirst({
    where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    select: warehouseSelectAdmin,
  });
};

export const create = async (data: CreateWarehouseInput & { code: string }) => {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.warehouses.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    return tx.warehouses.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        managerName: data.managerName || null,
        note: data.note || null,
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
      },
      select: warehouseSelectAdmin,
    });
  });
};

export const update = async (id: string, data: UpdateWarehouseInput) => {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.warehouses.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } });
    }

    const updateData: Prisma.warehousesUpdateInput = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.managerName !== undefined) updateData.managerName = data.managerName || null;
    if (data.note !== undefined) updateData.note = data.note || null;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return tx.warehouses.update({ where: { id, deletedAt: null }, data: updateData, select: warehouseSelectAdmin });
  });
};

export const softDelete = async (id: string, deletedById: string) => {
  return prisma.warehouses.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date(), deletedBy: deletedById, isActive: false, isDefault: false },
  });
};

export const restore = async (id: string) => {
  return prisma.warehouses.update({ where: { id }, data: { deletedAt: null, deletedBy: null }, select: warehouseSelectAdmin });
};

export const countActiveWarehouses = async (excludeId?: string): Promise<number> => {
  return prisma.warehouses.count({ where: { isActive: true, deletedAt: null, ...(excludeId && { id: { not: excludeId } }) } });
};

export const countStockRows = async (warehouseId: string): Promise<number> => {
  return prisma.variant_warehouse_stocks.count({ where: { warehouseId, quantity: { gt: 0 } } });
};

// ─── Dùng chéo module (inventory, order, checkout) ────────────────────────────

/**
 * Lấy kho mặc định để trừ/hoàn tồn kho khi có đơn hàng.
 * Ưu tiên kho đánh dấu isDefault, fallback về kho active đầu tiên nếu chưa cấu hình.
 * Trả về null nếu hệ thống chưa có kho nào — nơi gọi cần tự xử lý (không throw ở đây
 * để không làm gãy luồng checkout hiện có khi admin chưa kịp tạo kho).
 */
export const getDefaultWarehouseId = async (tx?: Prisma.TransactionClient): Promise<string | null> => {
  const client = tx ?? prisma;
  const defaultWarehouse = await client.warehouses.findFirst({
    where: { isDefault: true, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (defaultWarehouse) return defaultWarehouse.id;

  const fallback = await client.warehouses.findFirst({
    where: { isActive: true, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return fallback?.id ?? null;
};
