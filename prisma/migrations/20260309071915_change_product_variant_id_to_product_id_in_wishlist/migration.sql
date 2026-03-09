/*
  Warnings:

  - You are about to drop the column `productVariantId` on the `wishlist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,productId]` on the table `wishlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_productVariantId_fkey";

-- DropIndex
DROP INDEX "wishlist_userId_productVariantId_key";

-- AlterTable
ALTER TABLE "wishlist" DROP COLUMN "productVariantId",
ADD COLUMN     "productId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_userId_productId_key" ON "wishlist"("userId", "productId");

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
