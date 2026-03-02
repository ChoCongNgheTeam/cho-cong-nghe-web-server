/*
  Warnings:

  - A unique constraint covering the columns `[zaloPayTransId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "zaloPayTransId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_zaloPayTransId_key" ON "orders"("zaloPayTransId");
