/*
  Warnings:

  - The primary key for the `product_highlights` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `product_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `highlightId` on the `product_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `product_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `product_highlights` table. All the data in the column will be lost.
  - You are about to drop the `highlights` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `specificationId` to the `product_highlights` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_highlights" DROP CONSTRAINT "product_highlights_highlightId_fkey";

-- DropIndex
DROP INDEX "product_highlights_productId_highlightId_key";

-- AlterTable
ALTER TABLE "product_highlights" DROP CONSTRAINT "product_highlights_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "highlightId",
DROP COLUMN "id",
DROP COLUMN "value",
ADD COLUMN     "specificationId" UUID NOT NULL,
ADD CONSTRAINT "product_highlights_pkey" PRIMARY KEY ("productId", "specificationId");

-- DropTable
DROP TABLE "highlights";

-- CreateTable
CREATE TABLE "specifications" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "productId" UUID NOT NULL,
    "specificationId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("productId","specificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "specifications_key_key" ON "specifications"("key");

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_specificationId_fkey" FOREIGN KEY ("specificationId") REFERENCES "specifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_highlights" ADD CONSTRAINT "product_highlights_specificationId_fkey" FOREIGN KEY ("specificationId") REFERENCES "specifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
