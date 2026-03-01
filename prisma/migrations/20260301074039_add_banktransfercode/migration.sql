/*
  Warnings:

  - A unique constraint covering the columns `[bankTransferCode]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "bankTransferCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_bankTransferCode_key" ON "orders"("bankTransferCode");
