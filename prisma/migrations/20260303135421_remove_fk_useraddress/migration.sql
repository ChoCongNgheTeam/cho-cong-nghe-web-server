/*
  Warnings:

  - Added the required column `shippingContactName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingDetail` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingProvince` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingWard` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shippingAddressId_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippingContactName" TEXT NOT NULL,
ADD COLUMN     "shippingDetail" TEXT NOT NULL,
ADD COLUMN     "shippingPhone" TEXT NOT NULL,
ADD COLUMN     "shippingProvince" TEXT NOT NULL,
ADD COLUMN     "shippingWard" TEXT NOT NULL,
ALTER COLUMN "shippingAddressId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "orders_orderStatus_idx" ON "orders"("orderStatus");

-- CreateIndex
CREATE INDEX "orders_orderDate_idx" ON "orders"("orderDate");
