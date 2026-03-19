/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `orders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "orders_deletedAt_idx";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "deletedAt",
DROP COLUMN "deletedBy";
