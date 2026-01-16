/*
  Warnings:

  - You are about to drop the `product_highlights` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isHighlight` to the `product_specifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_highlights" DROP CONSTRAINT "product_highlights_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_highlights" DROP CONSTRAINT "product_highlights_specificationId_fkey";

-- AlterTable
ALTER TABLE "product_specifications" ADD COLUMN     "isHighlight" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "product_highlights";
