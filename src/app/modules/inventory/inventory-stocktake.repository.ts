import prisma from "@/config/db";
import { Prisma, StocktakeStatus } from "@prisma/client";
import { stocktakeSelectAdmin } from "./inventory.types";
import { generateStocktakeCode } from "./inventory.helpers";
import { applyStockMovementTx } from "./inventory.repository";
import { ListStocktakesQuery } from "./inventory.validation";

export const findAllAdmin = async (query: ListStocktakesQuery) => {
  const { page = 1, limit = 20, status, warehouseId } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.stocktakesWhereInput = {};
  if (status) where.status = status;
  if (warehouseId) where.warehouseId = warehouseId;

  const [data, total] = await prisma.$transaction([
    prisma.stocktakes.findMany({ where, select: stocktakeSelectAdmin, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.stocktakes.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id: string) => {
  return prisma.stocktakes.findUnique({ where: { id }, select: stocktakeSelectAdmin });
};

// Tạo phiếu kiểm kê: snapshot systemQuantity tại thời điểm tạo cho các variant chỉ định
// (hoặc toàn bộ variant đang có tồn kho > 0 tại kho này nếu không truyền danh sách).
export const create = async (params: { warehouseId: string; note?: string; productVariantIds?: string[]; createdBy: string }) => {
  return prisma.$transaction(async (tx) => {
    const stockRows = await tx.variant_warehouse_stocks.findMany({
      where: {
        warehouseId: params.warehouseId,
        ...(params.productVariantIds?.length ? { productVariantId: { in: params.productVariantIds } } : { quantity: { gt: 0 } }),
      },
      select: { productVariantId: true, quantity: true },
    });

    const stocktake = await tx.stocktakes.create({
      data: {
        code: generateStocktakeCode(),
        warehouseId: params.warehouseId,
        note: params.note || null,
        status: "DRAFT",
        createdBy: params.createdBy,
        items: {
          create: stockRows.map((row) => ({ productVariantId: row.productVariantId, systemQuantity: row.quantity })),
        },
      },
      select: stocktakeSelectAdmin,
    });

    return stocktake;
  });
};

export const updateItems = async (stocktakeId: string, items: { productVariantId: string; actualQuantity: number; note?: string }[]) => {
  return prisma.$transaction(
    async (tx) => {
      for (const item of items) {
        const existing = await tx.stocktake_items.findUnique({
          where: { stocktakeId_productVariantId: { stocktakeId, productVariantId: item.productVariantId } },
        });
        if (!existing) continue; // bỏ qua nếu variant không nằm trong phiếu (không throw để không chặn cả batch)

        await tx.stocktake_items.update({
          where: { id: existing.id },
          data: {
            actualQuantity: item.actualQuantity,
            difference: item.actualQuantity - existing.systemQuantity,
            note: item.note || null,
          },
        });
      }

      await tx.stocktakes.update({ where: { id: stocktakeId }, data: { status: "IN_PROGRESS" } });

      return tx.stocktakes.findUnique({ where: { id: stocktakeId }, select: stocktakeSelectAdmin });
    },
    { timeout: 60000 },
  );
};

// Hoàn tất kiểm kê: với mọi dòng đã nhập actualQuantity và có chênh lệch,
// tạo 1 dòng ADJUSTMENT trong stock_movements + cập nhật variant_warehouse_stocks.
export const complete = async (stocktakeId: string, performedBy: string) => {
  return prisma.$transaction(
    async (tx) => {
      const stocktake = await tx.stocktakes.findUnique({ where: { id: stocktakeId }, include: { items: true } });
      if (!stocktake) return null;

      for (const item of stocktake.items) {
        if (item.actualQuantity === null) continue; // chưa kiểm — bỏ qua, không tính là chênh lệch
        const diff = item.actualQuantity - item.systemQuantity;
        if (diff === 0) continue;

        await applyStockMovementTx(tx, {
          productVariantId: item.productVariantId,
          warehouseId: stocktake.warehouseId,
          quantityDelta: diff,
          type: "ADJUSTMENT",
          reason: "STOCKTAKE_ADJUSTMENT",
          stocktakeId: stocktake.id,
          note: `Điều chỉnh theo kiểm kê ${stocktake.code}`,
          performedBy,
        });
      }

      return tx.stocktakes.update({
        where: { id: stocktakeId },
        data: { status: "COMPLETED", completedAt: new Date() },
        select: stocktakeSelectAdmin,
      });
    },
    { timeout: 60000 },
  );
};

export const cancel = async (stocktakeId: string) => {
  return prisma.stocktakes.update({ where: { id: stocktakeId }, data: { status: "CANCELLED" }, select: stocktakeSelectAdmin });
};

export const isEditableStatus = (status: StocktakeStatus): boolean => status === "DRAFT" || status === "IN_PROGRESS";
