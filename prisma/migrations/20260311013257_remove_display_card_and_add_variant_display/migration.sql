/*
  Warnings:

  - You are about to drop the column `displayCard` on the `products_variants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VariantDisplayType" AS ENUM ('SELECTOR', 'CARD');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "variantDisplay" "VariantDisplayType" NOT NULL DEFAULT 'SELECTOR';

-- AlterTable
ALTER TABLE "products_variants" DROP COLUMN "displayCard";
