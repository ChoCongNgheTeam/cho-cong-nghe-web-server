import { Prisma } from "@prisma/client";

// Select variant kèm thông tin sản phẩm/thương hiệu/danh mục — dùng cho trang "Tồn kho sản phẩm"
export const inventoryVariantSelect = {
  id: true,
  code: true,
  price: true,
  quantity: true,
  isActive: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      brand: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      img: { select: { imageUrl: true }, take: 1 },
    },
  },
  variantAttributes: {
    select: {
      attributeOption: { select: { value: true, label: true, attribute: { select: { code: true, name: true } } } },
    },
  },
  warehouseStocks: {
    select: {
      id: true,
      warehouseId: true,
      quantity: true,
      lowStockThreshold: true,
      warehouse: { select: { id: true, name: true, code: true } },
    },
  },
} satisfies Prisma.products_variantsSelect;

export type InventoryVariantRow = Prisma.products_variantsGetPayload<{ select: typeof inventoryVariantSelect }>;

export const stockMovementSelectAdmin = {
  id: true,
  code: true,
  type: true,
  reason: true,
  quantity: true,
  unitCost: true,
  note: true,
  performedBy: true,
  createdAt: true,
  productVariant: {
    select: {
      id: true,
      code: true,
      product: { select: { id: true, name: true, slug: true } },
    },
  },
  warehouse: { select: { id: true, name: true, code: true } },
  supplier: { select: { id: true, name: true, code: true } },
  order: { select: { id: true, orderCode: true } },
  stocktake: { select: { id: true, code: true } },
} satisfies Prisma.stock_movementsSelect;

export type StockMovementRow = Prisma.stock_movementsGetPayload<{ select: typeof stockMovementSelectAdmin }>;

export const stocktakeSelectAdmin = {
  id: true,
  code: true,
  status: true,
  note: true,
  createdBy: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
  items: {
    select: {
      id: true,
      productVariantId: true,
      systemQuantity: true,
      actualQuantity: true,
      difference: true,
      note: true,
      productVariant: {
        select: { id: true, code: true, product: { select: { id: true, name: true, slug: true } } },
      },
    },
  },
} satisfies Prisma.stocktakesSelect;

export type StocktakeRow = Prisma.stocktakesGetPayload<{ select: typeof stocktakeSelectAdmin }>;
