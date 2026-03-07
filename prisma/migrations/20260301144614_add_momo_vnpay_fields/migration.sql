/*
  Warnings:

  - A unique constraint covering the columns `[momoOrderId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vnpayTxnRef]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "momoOrderId" TEXT,
ADD COLUMN     "vnpayTxnRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_momoOrderId_key" ON "orders"("momoOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_vnpayTxnRef_key" ON "orders"("vnpayTxnRef");
