-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('STOCK_IN', 'STOCK_OUT', 'SALE', 'RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('PURCHASE', 'DAMAGE', 'LOST', 'EXPIRED', 'RETURN_TO_SUPPLIER', 'CUSTOMER_RETURN', 'STOCKTAKE_ADJUSTMENT', 'ORDER_SALE', 'ORDER_CANCEL', 'INITIAL_STOCK', 'OTHER');

-- CreateEnum
CREATE TYPE "StocktakeStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "chat_memory_vectors_embedding_idx";

-- AlterTable
ALTER TABLE "staff_permissions" ADD COLUMN     "canManageSuppliers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageWarehouses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canStockIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canStockOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canStocktake" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canViewInventory" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "managerName" TEXT,
    "note" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "taxCode" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_warehouse_stocks" (
    "id" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_warehouse_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "reason" "StockMovementReason" NOT NULL DEFAULT 'OTHER',
    "productVariantId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(12,2),
    "supplierId" UUID,
    "orderId" UUID,
    "stocktakeId" UUID,
    "note" TEXT,
    "performedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocktakes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "warehouseId" UUID NOT NULL,
    "status" "StocktakeStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "createdBy" UUID,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocktakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocktake_items" (
    "id" UUID NOT NULL,
    "stocktakeId" UUID NOT NULL,
    "productVariantId" UUID NOT NULL,
    "systemQuantity" INTEGER NOT NULL,
    "actualQuantity" INTEGER,
    "difference" INTEGER,
    "note" TEXT,

    CONSTRAINT "stocktake_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_deletedAt_idx" ON "warehouses"("deletedAt");

-- CreateIndex
CREATE INDEX "warehouses_isDefault_idx" ON "warehouses"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_deletedAt_idx" ON "suppliers"("deletedAt");

-- CreateIndex
CREATE INDEX "variant_warehouse_stocks_warehouseId_idx" ON "variant_warehouse_stocks"("warehouseId");

-- CreateIndex
CREATE INDEX "variant_warehouse_stocks_productVariantId_idx" ON "variant_warehouse_stocks"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "variant_warehouse_stocks_productVariantId_warehouseId_key" ON "variant_warehouse_stocks"("productVariantId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_code_key" ON "stock_movements"("code");

-- CreateIndex
CREATE INDEX "stock_movements_productVariantId_idx" ON "stock_movements"("productVariantId");

-- CreateIndex
CREATE INDEX "stock_movements_warehouseId_idx" ON "stock_movements"("warehouseId");

-- CreateIndex
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

-- CreateIndex
CREATE INDEX "stock_movements_orderId_idx" ON "stock_movements"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "stocktakes_code_key" ON "stocktakes"("code");

-- CreateIndex
CREATE INDEX "stocktakes_warehouseId_idx" ON "stocktakes"("warehouseId");

-- CreateIndex
CREATE INDEX "stocktakes_status_idx" ON "stocktakes"("status");

-- CreateIndex
CREATE INDEX "stocktake_items_productVariantId_idx" ON "stocktake_items"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "stocktake_items_stocktakeId_productVariantId_key" ON "stocktake_items"("stocktakeId", "productVariantId");

-- AddForeignKey
ALTER TABLE "variant_warehouse_stocks" ADD CONSTRAINT "variant_warehouse_stocks_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "products_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_warehouse_stocks" ADD CONSTRAINT "variant_warehouse_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "products_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stocktakeId_fkey" FOREIGN KEY ("stocktakeId") REFERENCES "stocktakes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocktakes" ADD CONSTRAINT "stocktakes_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocktake_items" ADD CONSTRAINT "stocktake_items_stocktakeId_fkey" FOREIGN KEY ("stocktakeId") REFERENCES "stocktakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocktake_items" ADD CONSTRAINT "stocktake_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "products_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
